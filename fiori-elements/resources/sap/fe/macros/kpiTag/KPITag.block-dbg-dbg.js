/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/formatters/KPIFormatter", "sap/fe/core/helpers/BindingToolkit"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, kpiFormatters, BindingToolkit) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var _exports = {};
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var pathInModel = BindingToolkit.pathInModel;
  var formatResult = BindingToolkit.formatResult;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let KPITagBlock = (
  /**
   * A building block used to display a KPI in the Analytical List Page
   *
   * @private
   * @experimental
   */
  _dec = defineBuildingBlock({
    name: "KPITag",
    namespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = blockAttribute({
    type: "string",
    required: true
  }), _dec5 = blockAttribute({
    type: "boolean",
    required: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(KPITagBlock, _BuildingBlockBase);
    function KPITagBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "kpiModelName", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "hasUnit", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    _exports = KPITagBlock;
    var _proto = KPITagBlock.prototype;
    /**
     * Creates a binding expression for a specific property in the KPI model.
     *
     * @param propertyName The property to bind to in the KPI model
     * @returns A binding expression
     */
    _proto.getKpiPropertyExpression = function getKpiPropertyExpression(propertyName) {
      return pathInModel(`/${this.id}/manifest/sap.card/data/json/${propertyName}`, this.kpiModelName);
    }

    /**
     * Creates binding expressions for the KPITag's text and tooltip.
     *
     * @returns Object containing the binding expressions for the text and the tooltip
     */;
    _proto.getBindingExpressions = function getBindingExpressions() {
      const kpiTitle = this.metaPath.getProperty("Title");
      if (!kpiTitle) {
        return {
          text: undefined,
          tooltip: undefined
        };
      }
      const titleExpression = resolveBindingString(kpiTitle);
      return {
        text: formatResult([titleExpression], kpiFormatters.labelFormat),
        tooltip: formatResult([titleExpression, this.getKpiPropertyExpression("mainValueUnscaled"), this.getKpiPropertyExpression("mainUnit"), this.getKpiPropertyExpression("mainCriticality"), String(this.hasUnit)], kpiFormatters.tooltipFormat)
      };
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string
     */;
    _proto.getTemplate = function getTemplate() {
      const {
        text,
        tooltip
      } = this.getBindingExpressions();
      return xml`<m:GenericTag
			id="kpiTag-${this.id}"
			text="${text}"
			design="StatusIconHidden"
			status="${this.getKpiPropertyExpression("mainCriticality")}"
			class="sapUiTinyMarginBegin"
			tooltip="${tooltip}"
			press=".kpiManagement.onKPIPressed(\${$source>},'${this.id}')"
		>
			<m:ObjectNumber
				state="${this.getKpiPropertyExpression("mainCriticality")}"
				emphasized="false"
				number="${this.getKpiPropertyExpression("mainValue")}"
				unit="${this.getKpiPropertyExpression("mainUnit")}"

			/>
		</m:GenericTag>`;
    };
    return KPITagBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "kpiModelName", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "hasUnit", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = KPITagBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLUElUYWdCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJnZXRLcGlQcm9wZXJ0eUV4cHJlc3Npb24iLCJwcm9wZXJ0eU5hbWUiLCJwYXRoSW5Nb2RlbCIsImlkIiwia3BpTW9kZWxOYW1lIiwiZ2V0QmluZGluZ0V4cHJlc3Npb25zIiwia3BpVGl0bGUiLCJtZXRhUGF0aCIsImdldFByb3BlcnR5IiwidGV4dCIsInVuZGVmaW5lZCIsInRvb2x0aXAiLCJ0aXRsZUV4cHJlc3Npb24iLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsImZvcm1hdFJlc3VsdCIsImtwaUZvcm1hdHRlcnMiLCJsYWJlbEZvcm1hdCIsIlN0cmluZyIsImhhc1VuaXQiLCJ0b29sdGlwRm9ybWF0IiwiZ2V0VGVtcGxhdGUiLCJ4bWwiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiS1BJVGFnLmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQga3BpRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9LUElGb3JtYXR0ZXJcIjtcbmltcG9ydCB7IGZvcm1hdFJlc3VsdCwgcGF0aEluTW9kZWwsIHJlc29sdmVCaW5kaW5nU3RyaW5nIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbi8qKlxuICogQSBidWlsZGluZyBibG9jayB1c2VkIHRvIGRpc3BsYXkgYSBLUEkgaW4gdGhlIEFuYWx5dGljYWwgTGlzdCBQYWdlXG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIktQSVRhZ1wiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1BJVGFnQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBUaGUgSUQgb2YgdGhlIEtQSVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0cHVibGljIGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBQYXRoIHRvIHRoZSBEYXRhUG9pbnQgYW5ub3RhdGlvbiBvZiB0aGUgS1BJXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdHB1YmxpYyBtZXRhUGF0aCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIFRoZSBuYW1lIG9mIHRoZSBydW50aW1lIG1vZGVsIHRvIGdldCBLUEkgcHJvcGVydGllcyBmcm9tXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRwdWJsaWMga3BpTW9kZWxOYW1lITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBTaGFsbCBiZSB0cnVlIGlmIHRoZSBLUEkgdmFsdWUgaGFzIGFuIGFzc29jaWF0ZWQgY3VycmVuY3kgb3IgdW5pdCBvZiBtZWFzdXJlXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiwgcmVxdWlyZWQ6IGZhbHNlIH0pXG5cdHB1YmxpYyBoYXNVbml0PzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgYSBzcGVjaWZpYyBwcm9wZXJ0eSBpbiB0aGUgS1BJIG1vZGVsLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIFRoZSBwcm9wZXJ0eSB0byBiaW5kIHRvIGluIHRoZSBLUEkgbW9kZWxcblx0ICogQHJldHVybnMgQSBiaW5kaW5nIGV4cHJlc3Npb25cblx0ICovXG5cdGdldEtwaVByb3BlcnR5RXhwcmVzc2lvbihwcm9wZXJ0eU5hbWU6IHN0cmluZykge1xuXHRcdHJldHVybiBwYXRoSW5Nb2RlbChgLyR7dGhpcy5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uLyR7cHJvcGVydHlOYW1lfWAsIHRoaXMua3BpTW9kZWxOYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIHRoZSBLUElUYWcncyB0ZXh0IGFuZCB0b29sdGlwLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBPYmplY3QgY29udGFpbmluZyB0aGUgYmluZGluZyBleHByZXNzaW9ucyBmb3IgdGhlIHRleHQgYW5kIHRoZSB0b29sdGlwXG5cdCAqL1xuXHRnZXRCaW5kaW5nRXhwcmVzc2lvbnMoKSB7XG5cdFx0Y29uc3Qga3BpVGl0bGUgPSB0aGlzLm1ldGFQYXRoLmdldFByb3BlcnR5KFwiVGl0bGVcIik7XG5cblx0XHRpZiAoIWtwaVRpdGxlKSB7XG5cdFx0XHRyZXR1cm4geyB0ZXh0OiB1bmRlZmluZWQsIHRvb2x0aXA6IHVuZGVmaW5lZCB9O1xuXHRcdH1cblxuXHRcdGNvbnN0IHRpdGxlRXhwcmVzc2lvbiA9IHJlc29sdmVCaW5kaW5nU3RyaW5nPHN0cmluZz4oa3BpVGl0bGUpO1xuXHRcdHJldHVybiB7XG5cdFx0XHR0ZXh0OiBmb3JtYXRSZXN1bHQoW3RpdGxlRXhwcmVzc2lvbl0sIGtwaUZvcm1hdHRlcnMubGFiZWxGb3JtYXQpLFxuXHRcdFx0dG9vbHRpcDogZm9ybWF0UmVzdWx0KFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0dGl0bGVFeHByZXNzaW9uLFxuXHRcdFx0XHRcdHRoaXMuZ2V0S3BpUHJvcGVydHlFeHByZXNzaW9uKFwibWFpblZhbHVlVW5zY2FsZWRcIiksXG5cdFx0XHRcdFx0dGhpcy5nZXRLcGlQcm9wZXJ0eUV4cHJlc3Npb24oXCJtYWluVW5pdFwiKSxcblx0XHRcdFx0XHR0aGlzLmdldEtwaVByb3BlcnR5RXhwcmVzc2lvbihcIm1haW5Dcml0aWNhbGl0eVwiKSxcblx0XHRcdFx0XHRTdHJpbmcodGhpcy5oYXNVbml0KVxuXHRcdFx0XHRdLFxuXHRcdFx0XHRrcGlGb3JtYXR0ZXJzLnRvb2x0aXBGb3JtYXRcblx0XHRcdClcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmdW5jdGlvbi5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZ1xuXHQgKi9cblx0Z2V0VGVtcGxhdGUoKSB7XG5cdFx0Y29uc3QgeyB0ZXh0LCB0b29sdGlwIH0gPSB0aGlzLmdldEJpbmRpbmdFeHByZXNzaW9ucygpO1xuXG5cdFx0cmV0dXJuIHhtbGA8bTpHZW5lcmljVGFnXG5cdFx0XHRpZD1cImtwaVRhZy0ke3RoaXMuaWR9XCJcblx0XHRcdHRleHQ9XCIke3RleHR9XCJcblx0XHRcdGRlc2lnbj1cIlN0YXR1c0ljb25IaWRkZW5cIlxuXHRcdFx0c3RhdHVzPVwiJHt0aGlzLmdldEtwaVByb3BlcnR5RXhwcmVzc2lvbihcIm1haW5Dcml0aWNhbGl0eVwiKX1cIlxuXHRcdFx0Y2xhc3M9XCJzYXBVaVRpbnlNYXJnaW5CZWdpblwiXG5cdFx0XHR0b29sdGlwPVwiJHt0b29sdGlwfVwiXG5cdFx0XHRwcmVzcz1cIi5rcGlNYW5hZ2VtZW50Lm9uS1BJUHJlc3NlZChcXCR7JHNvdXJjZT59LCcke3RoaXMuaWR9JylcIlxuXHRcdD5cblx0XHRcdDxtOk9iamVjdE51bWJlclxuXHRcdFx0XHRzdGF0ZT1cIiR7dGhpcy5nZXRLcGlQcm9wZXJ0eUV4cHJlc3Npb24oXCJtYWluQ3JpdGljYWxpdHlcIil9XCJcblx0XHRcdFx0ZW1waGFzaXplZD1cImZhbHNlXCJcblx0XHRcdFx0bnVtYmVyPVwiJHt0aGlzLmdldEtwaVByb3BlcnR5RXhwcmVzc2lvbihcIm1haW5WYWx1ZVwiKX1cIlxuXHRcdFx0XHR1bml0PVwiJHt0aGlzLmdldEtwaVByb3BlcnR5RXhwcmVzc2lvbihcIm1haW5Vbml0XCIpfVwiXG5cblx0XHRcdC8+XG5cdFx0PC9tOkdlbmVyaWNUYWc+YDtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFpQnFCQSxXQUFXO0VBVmhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBLE9BTUNDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxTQUFTLEVBQUU7RUFDWixDQUFDLENBQUMsVUFLQUMsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQU1sREYsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxzQkFBc0I7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBTWhFRixjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBTWxERixjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUMsUUFBUSxFQUFFO0VBQU0sQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBR3JEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUxDLE9BTUFDLHdCQUF3QixHQUF4QixrQ0FBeUJDLFlBQW9CLEVBQUU7TUFDOUMsT0FBT0MsV0FBVyxDQUFFLElBQUcsSUFBSSxDQUFDQyxFQUFHLGdDQUErQkYsWUFBYSxFQUFDLEVBQUUsSUFBSSxDQUFDRyxZQUFZLENBQUM7SUFDakc7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQSxPQUpDO0lBQUEsT0FLQUMscUJBQXFCLEdBQXJCLGlDQUF3QjtNQUN2QixNQUFNQyxRQUFRLEdBQUcsSUFBSSxDQUFDQyxRQUFRLENBQUNDLFdBQVcsQ0FBQyxPQUFPLENBQUM7TUFFbkQsSUFBSSxDQUFDRixRQUFRLEVBQUU7UUFDZCxPQUFPO1VBQUVHLElBQUksRUFBRUMsU0FBUztVQUFFQyxPQUFPLEVBQUVEO1FBQVUsQ0FBQztNQUMvQztNQUVBLE1BQU1FLGVBQWUsR0FBR0Msb0JBQW9CLENBQVNQLFFBQVEsQ0FBQztNQUM5RCxPQUFPO1FBQ05HLElBQUksRUFBRUssWUFBWSxDQUFDLENBQUNGLGVBQWUsQ0FBQyxFQUFFRyxhQUFhLENBQUNDLFdBQVcsQ0FBQztRQUNoRUwsT0FBTyxFQUFFRyxZQUFZLENBQ3BCLENBQ0NGLGVBQWUsRUFDZixJQUFJLENBQUNaLHdCQUF3QixDQUFDLG1CQUFtQixDQUFDLEVBQ2xELElBQUksQ0FBQ0Esd0JBQXdCLENBQUMsVUFBVSxDQUFDLEVBQ3pDLElBQUksQ0FBQ0Esd0JBQXdCLENBQUMsaUJBQWlCLENBQUMsRUFDaERpQixNQUFNLENBQUMsSUFBSSxDQUFDQyxPQUFPLENBQUMsQ0FDcEIsRUFDREgsYUFBYSxDQUFDSSxhQUFhO01BRTdCLENBQUM7SUFDRjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQUtBQyxXQUFXLEdBQVgsdUJBQWM7TUFDYixNQUFNO1FBQUVYLElBQUk7UUFBRUU7TUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDTixxQkFBcUIsRUFBRTtNQUV0RCxPQUFPZ0IsR0FBSTtBQUNiLGdCQUFnQixJQUFJLENBQUNsQixFQUFHO0FBQ3hCLFdBQVdNLElBQUs7QUFDaEI7QUFDQSxhQUFhLElBQUksQ0FBQ1Qsd0JBQXdCLENBQUMsaUJBQWlCLENBQUU7QUFDOUQ7QUFDQSxjQUFjVyxPQUFRO0FBQ3RCLHNEQUFzRCxJQUFJLENBQUNSLEVBQUc7QUFDOUQ7QUFDQTtBQUNBLGFBQWEsSUFBSSxDQUFDSCx3QkFBd0IsQ0FBQyxpQkFBaUIsQ0FBRTtBQUM5RDtBQUNBLGNBQWMsSUFBSSxDQUFDQSx3QkFBd0IsQ0FBQyxXQUFXLENBQUU7QUFDekQsWUFBWSxJQUFJLENBQUNBLHdCQUF3QixDQUFDLFVBQVUsQ0FBRTtBQUN0RDtBQUNBO0FBQ0Esa0JBQWtCO0lBQ2pCLENBQUM7SUFBQTtFQUFBLEVBeEZ1Q3NCLGlCQUFpQjtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==