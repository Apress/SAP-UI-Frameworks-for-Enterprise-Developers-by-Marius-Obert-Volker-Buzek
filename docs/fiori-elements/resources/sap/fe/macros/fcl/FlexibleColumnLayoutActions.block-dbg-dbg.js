/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor) {
  "use strict";

  var _dec, _class;
  var _exports = {};
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let FlexibleColumnLayoutActionsBlock = (_dec = defineBuildingBlock({
    name: "FlexibleColumnLayoutActions",
    namespace: "sap.fe.macros.fcl",
    publicNamespace: "sap.fe.macros"
  }), _dec(_class = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FlexibleColumnLayoutActionsBlock, _BuildingBlockBase);
    function FlexibleColumnLayoutActionsBlock() {
      return _BuildingBlockBase.apply(this, arguments) || this;
    }
    _exports = FlexibleColumnLayoutActionsBlock;
    var _proto = FlexibleColumnLayoutActionsBlock.prototype;
    _proto.getTemplate = function getTemplate() {
      return xml`
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::FullScreen"
                type="Transparent"
                icon="{fclhelper>/actionButtonsInfo/switchIcon}"
                visible="{fclhelper>/actionButtonsInfo/switchVisible}"
                press="._routing.switchFullScreen()"
            />
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::Close"
                type="Transparent"
                icon="sap-icon://decline"
                tooltip="{sap.fe.i18n>C_COMMON_SAPFE_CLOSE}"
                visible="{fclhelper>/actionButtonsInfo/closeVisible}"
                press="._routing.closeColumn()"
            />`;
    };
    return FlexibleColumnLayoutActionsBlock;
  }(BuildingBlockBase)) || _class);
  _exports = FlexibleColumnLayoutActionsBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGbGV4aWJsZUNvbHVtbkxheW91dEFjdGlvbnNCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwiZ2V0VGVtcGxhdGUiLCJ4bWwiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmxleGlibGVDb2x1bW5MYXlvdXRBY3Rpb25zLmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB7IGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcblxuQGRlZmluZUJ1aWxkaW5nQmxvY2soeyBuYW1lOiBcIkZsZXhpYmxlQ29sdW1uTGF5b3V0QWN0aW9uc1wiLCBuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5mY2xcIiwgcHVibGljTmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIiB9KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmxleGlibGVDb2x1bW5MYXlvdXRBY3Rpb25zQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdHJldHVybiB4bWxgXG4gICAgICAgICAgICA8bTpPdmVyZmxvd1Rvb2xiYXJCdXR0b25cbiAgICAgICAgICAgICAgICBpZD1cImZlOjpGQ0xTdGFuZGFyZEFjdGlvbjo6RnVsbFNjcmVlblwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIlRyYW5zcGFyZW50XCJcbiAgICAgICAgICAgICAgICBpY29uPVwie2ZjbGhlbHBlcj4vYWN0aW9uQnV0dG9uc0luZm8vc3dpdGNoSWNvbn1cIlxuICAgICAgICAgICAgICAgIHZpc2libGU9XCJ7ZmNsaGVscGVyPi9hY3Rpb25CdXR0b25zSW5mby9zd2l0Y2hWaXNpYmxlfVwiXG4gICAgICAgICAgICAgICAgcHJlc3M9XCIuX3JvdXRpbmcuc3dpdGNoRnVsbFNjcmVlbigpXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8bTpPdmVyZmxvd1Rvb2xiYXJCdXR0b25cbiAgICAgICAgICAgICAgICBpZD1cImZlOjpGQ0xTdGFuZGFyZEFjdGlvbjo6Q2xvc2VcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJUcmFuc3BhcmVudFwiXG4gICAgICAgICAgICAgICAgaWNvbj1cInNhcC1pY29uOi8vZGVjbGluZVwiXG4gICAgICAgICAgICAgICAgdG9vbHRpcD1cIntzYXAuZmUuaTE4bj5DX0NPTU1PTl9TQVBGRV9DTE9TRX1cIlxuICAgICAgICAgICAgICAgIHZpc2libGU9XCJ7ZmNsaGVscGVyPi9hY3Rpb25CdXR0b25zSW5mby9jbG9zZVZpc2libGV9XCJcbiAgICAgICAgICAgICAgICBwcmVzcz1cIi5fcm91dGluZy5jbG9zZUNvbHVtbigpXCJcbiAgICAgICAgICAgIC8+YDtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O01BS3FCQSxnQ0FBZ0MsV0FEcERDLG1CQUFtQixDQUFDO0lBQUVDLElBQUksRUFBRSw2QkFBNkI7SUFBRUMsU0FBUyxFQUFFLG1CQUFtQjtJQUFFQyxlQUFlLEVBQUU7RUFBZ0IsQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUEsT0FFOUhDLFdBQVcsR0FBWCx1QkFBYztNQUNiLE9BQU9DLEdBQUk7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtJQUNkLENBQUM7SUFBQTtFQUFBLEVBbEI0REMsaUJBQWlCO0VBQUE7RUFBQTtBQUFBIn0=