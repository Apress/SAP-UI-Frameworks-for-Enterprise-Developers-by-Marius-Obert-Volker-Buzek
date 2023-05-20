/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, BindingToolkit, StableIdHelper) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var _exports = {};
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let PaginatorBlock = (
  /**
   * Building block used to create a paginator control.
   *
   * Usage example:
   * <pre>
   * &lt;macro:Paginator /&gt;
   * </pre>
   *
   * @hideconstructor
   * @public
   * @since 1.94.0
   */
  _dec = defineBuildingBlock({
    name: "Paginator",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(PaginatorBlock, _BuildingBlockBase);
    function PaginatorBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    _exports = PaginatorBlock;
    var _proto = PaginatorBlock.prototype;
    /**
     * The building block template function.
     *
     * @returns An XML-based string
     */
    _proto.getTemplate = function getTemplate() {
      // The model name is hardcoded, as this building block can also be used transparently by application developers
      const navUpEnabledExpression = pathInModel("/navUpEnabled", "paginator");
      const navDownEnabledExpression = pathInModel("/navDownEnabled", "paginator");
      const visibleExpression = or(navUpEnabledExpression, navDownEnabledExpression);
      const navUpTooltipExpression = pathInModel("T_PAGINATOR_CONTROL_PAGINATOR_TOOLTIP_UP", "sap.fe.i18n");
      const navDownTooltipExpression = pathInModel("T_PAGINATOR_CONTROL_PAGINATOR_TOOLTIP_DOWN", "sap.fe.i18n");
      return xml`
			<m:HBox displayInline="true" id="${this.id}" visible="${visibleExpression}">
				<uxap:ObjectPageHeaderActionButton
					xmlns:uxap="sap.uxap"
					id="${generate([this.id, "previousItem"])}"
					enabled="${navUpEnabledExpression}"
					tooltip="${navUpTooltipExpression}"
					icon="sap-icon://navigation-up-arrow"
					press=".paginator.updateCurrentContext(-1)"
					type="Transparent"
					importance="High"
				/>
				<uxap:ObjectPageHeaderActionButton
					xmlns:uxap="sap.uxap"
					id="${generate([this.id, "nextItem"])}"
					enabled="${navDownEnabledExpression}"
					tooltip="${navDownTooltipExpression}"
					icon="sap-icon://navigation-down-arrow"
					press=".paginator.updateCurrentContext(1)"
					type="Transparent"
					importance="High"
				/>
			</m:HBox>`;
    };
    return PaginatorBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  })), _class2)) || _class);
  _exports = PaginatorBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWdpbmF0b3JCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJnZXRUZW1wbGF0ZSIsIm5hdlVwRW5hYmxlZEV4cHJlc3Npb24iLCJwYXRoSW5Nb2RlbCIsIm5hdkRvd25FbmFibGVkRXhwcmVzc2lvbiIsInZpc2libGVFeHByZXNzaW9uIiwib3IiLCJuYXZVcFRvb2x0aXBFeHByZXNzaW9uIiwibmF2RG93blRvb2x0aXBFeHByZXNzaW9uIiwieG1sIiwiaWQiLCJnZW5lcmF0ZSIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQYWdpbmF0b3IuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IG9yLCBwYXRoSW5Nb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgdXNlZCB0byBjcmVhdGUgYSBwYWdpbmF0b3IgY29udHJvbC5cbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpQYWdpbmF0b3IgLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjk0LjBcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIlBhZ2luYXRvclwiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHRwdWJsaWNOYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFnaW5hdG9yQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBUaGUgaWRlbnRpZmllciBvZiB0aGUgUGFnaW5hdG9yIGNvbnRyb2wuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRwdWJsaWMgaWQgPSBcIlwiO1xuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgdGVtcGxhdGUgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmdcblx0ICovXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdC8vIFRoZSBtb2RlbCBuYW1lIGlzIGhhcmRjb2RlZCwgYXMgdGhpcyBidWlsZGluZyBibG9jayBjYW4gYWxzbyBiZSB1c2VkIHRyYW5zcGFyZW50bHkgYnkgYXBwbGljYXRpb24gZGV2ZWxvcGVyc1xuXHRcdGNvbnN0IG5hdlVwRW5hYmxlZEV4cHJlc3Npb24gPSBwYXRoSW5Nb2RlbChcIi9uYXZVcEVuYWJsZWRcIiwgXCJwYWdpbmF0b3JcIik7XG5cdFx0Y29uc3QgbmF2RG93bkVuYWJsZWRFeHByZXNzaW9uID0gcGF0aEluTW9kZWwoXCIvbmF2RG93bkVuYWJsZWRcIiwgXCJwYWdpbmF0b3JcIik7XG5cdFx0Y29uc3QgdmlzaWJsZUV4cHJlc3Npb24gPSBvcihuYXZVcEVuYWJsZWRFeHByZXNzaW9uLCBuYXZEb3duRW5hYmxlZEV4cHJlc3Npb24pO1xuXG5cdFx0Y29uc3QgbmF2VXBUb29sdGlwRXhwcmVzc2lvbiA9IHBhdGhJbk1vZGVsKFwiVF9QQUdJTkFUT1JfQ09OVFJPTF9QQUdJTkFUT1JfVE9PTFRJUF9VUFwiLCBcInNhcC5mZS5pMThuXCIpO1xuXHRcdGNvbnN0IG5hdkRvd25Ub29sdGlwRXhwcmVzc2lvbiA9IHBhdGhJbk1vZGVsKFwiVF9QQUdJTkFUT1JfQ09OVFJPTF9QQUdJTkFUT1JfVE9PTFRJUF9ET1dOXCIsIFwic2FwLmZlLmkxOG5cIik7XG5cblx0XHRyZXR1cm4geG1sYFxuXHRcdFx0PG06SEJveCBkaXNwbGF5SW5saW5lPVwidHJ1ZVwiIGlkPVwiJHt0aGlzLmlkfVwiIHZpc2libGU9XCIke3Zpc2libGVFeHByZXNzaW9ufVwiPlxuXHRcdFx0XHQ8dXhhcDpPYmplY3RQYWdlSGVhZGVyQWN0aW9uQnV0dG9uXG5cdFx0XHRcdFx0eG1sbnM6dXhhcD1cInNhcC51eGFwXCJcblx0XHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwicHJldmlvdXNJdGVtXCJdKX1cIlxuXHRcdFx0XHRcdGVuYWJsZWQ9XCIke25hdlVwRW5hYmxlZEV4cHJlc3Npb259XCJcblx0XHRcdFx0XHR0b29sdGlwPVwiJHtuYXZVcFRvb2x0aXBFeHByZXNzaW9ufVwiXG5cdFx0XHRcdFx0aWNvbj1cInNhcC1pY29uOi8vbmF2aWdhdGlvbi11cC1hcnJvd1wiXG5cdFx0XHRcdFx0cHJlc3M9XCIucGFnaW5hdG9yLnVwZGF0ZUN1cnJlbnRDb250ZXh0KC0xKVwiXG5cdFx0XHRcdFx0dHlwZT1cIlRyYW5zcGFyZW50XCJcblx0XHRcdFx0XHRpbXBvcnRhbmNlPVwiSGlnaFwiXG5cdFx0XHRcdC8+XG5cdFx0XHRcdDx1eGFwOk9iamVjdFBhZ2VIZWFkZXJBY3Rpb25CdXR0b25cblx0XHRcdFx0XHR4bWxuczp1eGFwPVwic2FwLnV4YXBcIlxuXHRcdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJuZXh0SXRlbVwiXSl9XCJcblx0XHRcdFx0XHRlbmFibGVkPVwiJHtuYXZEb3duRW5hYmxlZEV4cHJlc3Npb259XCJcblx0XHRcdFx0XHR0b29sdGlwPVwiJHtuYXZEb3duVG9vbHRpcEV4cHJlc3Npb259XCJcblx0XHRcdFx0XHRpY29uPVwic2FwLWljb246Ly9uYXZpZ2F0aW9uLWRvd24tYXJyb3dcIlxuXHRcdFx0XHRcdHByZXNzPVwiLnBhZ2luYXRvci51cGRhdGVDdXJyZW50Q29udGV4dCgxKVwiXG5cdFx0XHRcdFx0dHlwZT1cIlRyYW5zcGFyZW50XCJcblx0XHRcdFx0XHRpbXBvcnRhbmNlPVwiSGlnaFwiXG5cdFx0XHRcdC8+XG5cdFx0XHQ8L206SEJveD5gO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXVCcUJBLGNBQWM7RUFqQm5DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVhBLE9BWUNDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsV0FBVztJQUNqQkMsU0FBUyxFQUFFLHdCQUF3QjtJQUNuQ0MsZUFBZSxFQUFFO0VBQ2xCLENBQUMsQ0FBQyxVQUtBQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBR25EO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFKQyxPQUtBQyxXQUFXLEdBQVgsdUJBQWM7TUFDYjtNQUNBLE1BQU1DLHNCQUFzQixHQUFHQyxXQUFXLENBQUMsZUFBZSxFQUFFLFdBQVcsQ0FBQztNQUN4RSxNQUFNQyx3QkFBd0IsR0FBR0QsV0FBVyxDQUFDLGlCQUFpQixFQUFFLFdBQVcsQ0FBQztNQUM1RSxNQUFNRSxpQkFBaUIsR0FBR0MsRUFBRSxDQUFDSixzQkFBc0IsRUFBRUUsd0JBQXdCLENBQUM7TUFFOUUsTUFBTUcsc0JBQXNCLEdBQUdKLFdBQVcsQ0FBQywwQ0FBMEMsRUFBRSxhQUFhLENBQUM7TUFDckcsTUFBTUssd0JBQXdCLEdBQUdMLFdBQVcsQ0FBQyw0Q0FBNEMsRUFBRSxhQUFhLENBQUM7TUFFekcsT0FBT00sR0FBSTtBQUNiLHNDQUFzQyxJQUFJLENBQUNDLEVBQUcsY0FBYUwsaUJBQWtCO0FBQzdFO0FBQ0E7QUFDQSxXQUFXTSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUNELEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBRTtBQUMvQyxnQkFBZ0JSLHNCQUF1QjtBQUN2QyxnQkFBZ0JLLHNCQUF1QjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVdJLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQ0QsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFFO0FBQzNDLGdCQUFnQk4sd0JBQXlCO0FBQ3pDLGdCQUFnQkksd0JBQXlCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0lBQ1osQ0FBQztJQUFBO0VBQUEsRUE1QzBDSSxpQkFBaUI7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BS2hELEVBQUU7SUFBQTtFQUFBO0VBQUE7RUFBQTtBQUFBIn0=