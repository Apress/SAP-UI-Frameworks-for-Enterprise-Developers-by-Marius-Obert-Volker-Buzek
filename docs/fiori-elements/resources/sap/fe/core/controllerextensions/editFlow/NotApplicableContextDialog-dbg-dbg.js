/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/templating/EntityTypeHelper", "sap/m/Button", "sap/m/CustomListItem", "sap/m/Dialog", "sap/m/HBox", "sap/m/List", "sap/m/Text", "sap/m/VBox", "sap/fe/core/jsx-runtime/jsx", "sap/fe/core/jsx-runtime/Fragment", "sap/fe/core/jsx-runtime/jsxs"], function (EntityTypeHelper, Button, CustomListItem, Dialog, HBox, List, Text, VBox, _jsx, _Fragment, _jsxs) {
  "use strict";

  var _exports = {};
  var getTitleExpression = EntityTypeHelper.getTitleExpression;
  /**
   * Display a dialog to inform the user that some contexts are not applicable for the action.
   * This is not the target Ux but just keeping the current behavior
   */
  let NotApplicableContextDialog = /*#__PURE__*/function () {
    function NotApplicableContextDialog(props) {
      this.totalContextCount = 0;
      this.title = props.title;
      this.resourceModel = props.resourceModel;
      this.entityType = props.entityType;
      this.notApplicableContexts = props.notApplicableContexts;
      this._shouldContinue = false;
      this._dialog = this.createDialog();
      this._processingPromise = new Promise(resolve => {
        this._fnResolve = resolve;
      });
    }
    _exports = NotApplicableContextDialog;
    var _proto = NotApplicableContextDialog.prototype;
    _proto.onAfterClose = function onAfterClose() {
      this._fnResolve(this._shouldContinue);
      this._dialog.destroy();
    };
    _proto.onContinue = function onContinue() {
      this._shouldContinue = true;
      this._dialog.close();
    };
    _proto.open = async function open(owner) {
      owner.addDependent(this._dialog);
      this._dialog.open();
      return this._processingPromise;
    };
    _proto.getDialog = function getDialog() {
      return this._dialog;
    };
    _proto.createDialog = function createDialog() {
      var _this$entityType$anno, _this$entityType$anno2;
      return _jsx(Dialog, {
        state: "Warning",
        showHeader: true,
        contentWidth: "20rem",
        resizable: true,
        verticalScrolling: true,
        horizontalScrolling: true,
        class: "sapUiContentPadding",
        title: this.title,
        afterClose: this.onAfterClose.bind(this),
        children: {
          beginButton: _jsx(Button, {
            text: this.resourceModel.getText("C_ACTION_PARTIAL_FRAGMENT_SAPFE_CONTINUE_ANYWAY"),
            press: this.onContinue.bind(this),
            type: "Emphasized"
          }),
          endButton: _jsx(Button, {
            text: this.resourceModel.getText("C_COMMON_SAPFE_CLOSE"),
            press: () => this._dialog.close()
          }),
          content: _jsxs(_Fragment, {
            children: [_jsx(VBox, {
              children: _jsx(Text, {
                text: this.resourceModel.getText("C_ACTION_PARTIAL_FRAGMENT_SAPFE_BOUND_ACTION", [this.notApplicableContexts.length]),
                class: "sapUiTinyMarginBegin sapUiTinyMarginTopBottom"
              })
            }), _jsx(List, {
              headerText: (_this$entityType$anno = this.entityType.annotations.UI) === null || _this$entityType$anno === void 0 ? void 0 : (_this$entityType$anno2 = _this$entityType$anno.HeaderInfo) === null || _this$entityType$anno2 === void 0 ? void 0 : _this$entityType$anno2.TypeNamePlural,
              showSeparators: "None",
              children: {
                items: this.notApplicableContexts.map(notApplicableContext => {
                  // Either show the HeaderInfoName or the Semantic Key property
                  const titleExpression = getTitleExpression(this.entityType);
                  const customListItem = _jsx(CustomListItem, {
                    children: _jsx(HBox, {
                      justifyContent: "Start",
                      children: _jsx(Text, {
                        text: titleExpression,
                        class: "sapUiTinyMarginBegin sapUiTinyMarginTopBottom"
                      })
                    })
                  });
                  customListItem.setBindingContext(notApplicableContext);
                  return customListItem;
                })
              }
            })]
          })
        }
      });
    };
    return NotApplicableContextDialog;
  }();
  _exports = NotApplicableContextDialog;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb3RBcHBsaWNhYmxlQ29udGV4dERpYWxvZyIsInByb3BzIiwidG90YWxDb250ZXh0Q291bnQiLCJ0aXRsZSIsInJlc291cmNlTW9kZWwiLCJlbnRpdHlUeXBlIiwibm90QXBwbGljYWJsZUNvbnRleHRzIiwiX3Nob3VsZENvbnRpbnVlIiwiX2RpYWxvZyIsImNyZWF0ZURpYWxvZyIsIl9wcm9jZXNzaW5nUHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiX2ZuUmVzb2x2ZSIsIm9uQWZ0ZXJDbG9zZSIsImRlc3Ryb3kiLCJvbkNvbnRpbnVlIiwiY2xvc2UiLCJvcGVuIiwib3duZXIiLCJhZGREZXBlbmRlbnQiLCJnZXREaWFsb2ciLCJiaW5kIiwiYmVnaW5CdXR0b24iLCJnZXRUZXh0IiwiZW5kQnV0dG9uIiwiY29udGVudCIsImxlbmd0aCIsImFubm90YXRpb25zIiwiVUkiLCJIZWFkZXJJbmZvIiwiVHlwZU5hbWVQbHVyYWwiLCJpdGVtcyIsIm1hcCIsIm5vdEFwcGxpY2FibGVDb250ZXh0IiwidGl0bGVFeHByZXNzaW9uIiwiZ2V0VGl0bGVFeHByZXNzaW9uIiwiY3VzdG9tTGlzdEl0ZW0iLCJzZXRCaW5kaW5nQ29udGV4dCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTm90QXBwbGljYWJsZUNvbnRleHREaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudGl0eVR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgeyBnZXRUaXRsZUV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9FbnRpdHlUeXBlSGVscGVyXCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBDdXN0b21MaXN0SXRlbSBmcm9tIFwic2FwL20vQ3VzdG9tTGlzdEl0ZW1cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IEhCb3ggZnJvbSBcInNhcC9tL0hCb3hcIjtcbmltcG9ydCBMaXN0IGZyb20gXCJzYXAvbS9MaXN0XCI7XG5pbXBvcnQgVGV4dCBmcm9tIFwic2FwL20vVGV4dFwiO1xuaW1wb3J0IFZCb3ggZnJvbSBcInNhcC9tL1ZCb3hcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcblxuLyoqXG4gKiBEaXNwbGF5IGEgZGlhbG9nIHRvIGluZm9ybSB0aGUgdXNlciB0aGF0IHNvbWUgY29udGV4dHMgYXJlIG5vdCBhcHBsaWNhYmxlIGZvciB0aGUgYWN0aW9uLlxuICogVGhpcyBpcyBub3QgdGhlIHRhcmdldCBVeCBidXQganVzdCBrZWVwaW5nIHRoZSBjdXJyZW50IGJlaGF2aW9yXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vdEFwcGxpY2FibGVDb250ZXh0RGlhbG9nIHtcblx0cHJpdmF0ZSByZWFkb25seSB0aXRsZTogc3RyaW5nO1xuXG5cdHByaXZhdGUgcmVhZG9ubHkgdG90YWxDb250ZXh0Q291bnQ6IG51bWJlciA9IDA7XG5cblx0cHJpdmF0ZSByZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsO1xuXG5cdHByaXZhdGUgcmVhZG9ubHkgZW50aXR5VHlwZTogRW50aXR5VHlwZTtcblxuXHRwcml2YXRlIHJlYWRvbmx5IF9kaWFsb2c6IERpYWxvZztcblxuXHRwcml2YXRlIHJlYWRvbmx5IF9wcm9jZXNzaW5nUHJvbWlzZTogUHJvbWlzZTxib29sZWFuPjtcblxuXHRwcml2YXRlIF9mblJlc29sdmUhOiAocmVzb2x2ZVZhbHVlOiBib29sZWFuKSA9PiB2b2lkO1xuXG5cdHByaXZhdGUgX3Nob3VsZENvbnRpbnVlOiBib29sZWFuO1xuXG5cdHByaXZhdGUgbm90QXBwbGljYWJsZUNvbnRleHRzOiBDb250ZXh0W107XG5cblx0Y29uc3RydWN0b3IocHJvcHM6IHsgdGl0bGU6IHN0cmluZzsgZW50aXR5VHlwZTogRW50aXR5VHlwZTsgcmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbDsgbm90QXBwbGljYWJsZUNvbnRleHRzOiBDb250ZXh0W10gfSkge1xuXHRcdHRoaXMudGl0bGUgPSBwcm9wcy50aXRsZTtcblx0XHR0aGlzLnJlc291cmNlTW9kZWwgPSBwcm9wcy5yZXNvdXJjZU1vZGVsO1xuXHRcdHRoaXMuZW50aXR5VHlwZSA9IHByb3BzLmVudGl0eVR5cGU7XG5cdFx0dGhpcy5ub3RBcHBsaWNhYmxlQ29udGV4dHMgPSBwcm9wcy5ub3RBcHBsaWNhYmxlQ29udGV4dHM7XG5cdFx0dGhpcy5fc2hvdWxkQ29udGludWUgPSBmYWxzZTtcblx0XHR0aGlzLl9kaWFsb2cgPSB0aGlzLmNyZWF0ZURpYWxvZygpO1xuXHRcdHRoaXMuX3Byb2Nlc3NpbmdQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHRoaXMuX2ZuUmVzb2x2ZSA9IHJlc29sdmU7XG5cdFx0fSk7XG5cdH1cblxuXHRvbkFmdGVyQ2xvc2UoKSB7XG5cdFx0dGhpcy5fZm5SZXNvbHZlKHRoaXMuX3Nob3VsZENvbnRpbnVlKTtcblx0XHR0aGlzLl9kaWFsb2cuZGVzdHJveSgpO1xuXHR9XG5cblx0b25Db250aW51ZSgpIHtcblx0XHR0aGlzLl9zaG91bGRDb250aW51ZSA9IHRydWU7XG5cdFx0dGhpcy5fZGlhbG9nLmNsb3NlKCk7XG5cdH1cblxuXHRhc3luYyBvcGVuKG93bmVyOiBDb250cm9sKSB7XG5cdFx0b3duZXIuYWRkRGVwZW5kZW50KHRoaXMuX2RpYWxvZyk7XG5cdFx0dGhpcy5fZGlhbG9nLm9wZW4oKTtcblx0XHRyZXR1cm4gdGhpcy5fcHJvY2Vzc2luZ1Byb21pc2U7XG5cdH1cblxuXHRnZXREaWFsb2coKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2RpYWxvZztcblx0fVxuXG5cdGNyZWF0ZURpYWxvZygpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PERpYWxvZ1xuXHRcdFx0XHRzdGF0ZT17XCJXYXJuaW5nXCJ9XG5cdFx0XHRcdHNob3dIZWFkZXI9e3RydWV9XG5cdFx0XHRcdGNvbnRlbnRXaWR0aD17XCIyMHJlbVwifVxuXHRcdFx0XHRyZXNpemFibGU9e3RydWV9XG5cdFx0XHRcdHZlcnRpY2FsU2Nyb2xsaW5nPXt0cnVlfVxuXHRcdFx0XHRob3Jpem9udGFsU2Nyb2xsaW5nPXt0cnVlfVxuXHRcdFx0XHRjbGFzcz17XCJzYXBVaUNvbnRlbnRQYWRkaW5nXCJ9XG5cdFx0XHRcdHRpdGxlPXt0aGlzLnRpdGxlfVxuXHRcdFx0XHRhZnRlckNsb3NlPXt0aGlzLm9uQWZ0ZXJDbG9zZS5iaW5kKHRoaXMpfVxuXHRcdFx0PlxuXHRcdFx0XHR7e1xuXHRcdFx0XHRcdGJlZ2luQnV0dG9uOiAoXG5cdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdHRleHQ9e3RoaXMucmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19BQ1RJT05fUEFSVElBTF9GUkFHTUVOVF9TQVBGRV9DT05USU5VRV9BTllXQVlcIil9XG5cdFx0XHRcdFx0XHRcdHByZXNzPXt0aGlzLm9uQ29udGludWUuYmluZCh0aGlzKX1cblx0XHRcdFx0XHRcdFx0dHlwZT1cIkVtcGhhc2l6ZWRcIlxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdGVuZEJ1dHRvbjogPEJ1dHRvbiB0ZXh0PXt0aGlzLnJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0NMT1NFXCIpfSBwcmVzcz17KCkgPT4gdGhpcy5fZGlhbG9nLmNsb3NlKCl9IC8+LFxuXHRcdFx0XHRcdGNvbnRlbnQ6IChcblx0XHRcdFx0XHRcdDw+XG5cdFx0XHRcdFx0XHRcdDxWQm94PlxuXHRcdFx0XHRcdFx0XHRcdDxUZXh0XG5cdFx0XHRcdFx0XHRcdFx0XHR0ZXh0PXt0aGlzLnJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQUNUSU9OX1BBUlRJQUxfRlJBR01FTlRfU0FQRkVfQk9VTkRfQUNUSU9OXCIsIFtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5ub3RBcHBsaWNhYmxlQ29udGV4dHMubGVuZ3RoXG5cdFx0XHRcdFx0XHRcdFx0XHRdKX1cblx0XHRcdFx0XHRcdFx0XHRcdGNsYXNzPVwic2FwVWlUaW55TWFyZ2luQmVnaW4gc2FwVWlUaW55TWFyZ2luVG9wQm90dG9tXCJcblx0XHRcdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdFx0XHQ8L1ZCb3g+XG5cdFx0XHRcdFx0XHRcdDxMaXN0IGhlYWRlclRleHQ9e3RoaXMuZW50aXR5VHlwZS5hbm5vdGF0aW9ucy5VST8uSGVhZGVySW5mbz8uVHlwZU5hbWVQbHVyYWx9IHNob3dTZXBhcmF0b3JzPVwiTm9uZVwiPlxuXHRcdFx0XHRcdFx0XHRcdHt7XG5cdFx0XHRcdFx0XHRcdFx0XHRpdGVtczogdGhpcy5ub3RBcHBsaWNhYmxlQ29udGV4dHMubWFwKChub3RBcHBsaWNhYmxlQ29udGV4dCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBFaXRoZXIgc2hvdyB0aGUgSGVhZGVySW5mb05hbWUgb3IgdGhlIFNlbWFudGljIEtleSBwcm9wZXJ0eVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCB0aXRsZUV4cHJlc3Npb24gPSBnZXRUaXRsZUV4cHJlc3Npb24odGhpcy5lbnRpdHlUeXBlKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgY3VzdG9tTGlzdEl0ZW0gPSAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PEN1c3RvbUxpc3RJdGVtPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PEhCb3gganVzdGlmeUNvbnRlbnQ9e1wiU3RhcnRcIn0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUZXh0IHRleHQ9e3RpdGxlRXhwcmVzc2lvbn0gY2xhc3M9XCJzYXBVaVRpbnlNYXJnaW5CZWdpbiBzYXBVaVRpbnlNYXJnaW5Ub3BCb3R0b21cIiAvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9IQm94PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvQ3VzdG9tTGlzdEl0ZW0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGN1c3RvbUxpc3RJdGVtLnNldEJpbmRpbmdDb250ZXh0KG5vdEFwcGxpY2FibGVDb250ZXh0KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGN1c3RvbUxpc3RJdGVtO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdFx0XHQ8L0xpc3Q+XG5cdFx0XHRcdFx0XHQ8Lz5cblx0XHRcdFx0XHQpXG5cdFx0XHRcdH19XG5cdFx0XHQ8L0RpYWxvZz5cblx0XHQpIGFzIERpYWxvZztcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7RUFhQTtBQUNBO0FBQ0E7QUFDQTtFQUhBLElBSXFCQSwwQkFBMEI7SUFtQjlDLG9DQUFZQyxLQUFnSCxFQUFFO01BQUEsS0FoQjdHQyxpQkFBaUIsR0FBVyxDQUFDO01BaUI3QyxJQUFJLENBQUNDLEtBQUssR0FBR0YsS0FBSyxDQUFDRSxLQUFLO01BQ3hCLElBQUksQ0FBQ0MsYUFBYSxHQUFHSCxLQUFLLENBQUNHLGFBQWE7TUFDeEMsSUFBSSxDQUFDQyxVQUFVLEdBQUdKLEtBQUssQ0FBQ0ksVUFBVTtNQUNsQyxJQUFJLENBQUNDLHFCQUFxQixHQUFHTCxLQUFLLENBQUNLLHFCQUFxQjtNQUN4RCxJQUFJLENBQUNDLGVBQWUsR0FBRyxLQUFLO01BQzVCLElBQUksQ0FBQ0MsT0FBTyxHQUFHLElBQUksQ0FBQ0MsWUFBWSxFQUFFO01BQ2xDLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUcsSUFBSUMsT0FBTyxDQUFFQyxPQUFPLElBQUs7UUFDbEQsSUFBSSxDQUFDQyxVQUFVLEdBQUdELE9BQU87TUFDMUIsQ0FBQyxDQUFDO0lBQ0g7SUFBQztJQUFBO0lBQUEsT0FF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