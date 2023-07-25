/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/helpers/ClassSupport", "sap/m/Button", "sap/m/Dialog", "sap/m/library", "sap/m/Page", "sap/m/Panel", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/fe/core/jsx-runtime/jsx"], function (BuildingBlockSupport, RuntimeBuildingBlock, ClassSupport, Button, Dialog, mLibrary, Page, Panel, Component, Core, JsControlTreeModifier, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var defineReference = ClassSupport.defineReference;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const ButtonType = mLibrary.ButtonType;
  let TableFullScreenDialogBlock = (_dec = defineBuildingBlock({
    name: "TableFullScreenDialog",
    namespace: "sap.fe.macros.table"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = defineReference(), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(TableFullScreenDialogBlock, _RuntimeBuildingBlock);
    function TableFullScreenDialogBlock(props) {
      var _this;
      _this = _RuntimeBuildingBlock.call(this, props) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fullScreenButton", _descriptor2, _assertThisInitialized(_this));
      _this.fullScreenDialogContentPage = new Page();
      _this.enteringFullScreen = false;
      _this.messageBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      return _this;
    }
    _exports = TableFullScreenDialogBlock;
    var _proto = TableFullScreenDialogBlock.prototype;
    /**
     * Main handler for switching between full screen dialog and normal display.
     *
     * @function
     * @name onFullScreenToggle
     */
    _proto.onFullScreenToggle = async function onFullScreenToggle() {
      this.enteringFullScreen = !this.enteringFullScreen;
      this.tableAPI = this.getTableAPI();
      if (!this.tablePlaceHolderPanel) {
        this.tablePlaceHolderPanel = this.createTablePlaceHolderPanel();
      }
      if (this.enteringFullScreen) {
        var _this$fullScreenButto, _this$fullScreenButto2;
        // change the button icon and text
        (_this$fullScreenButto = this.fullScreenButton.current) === null || _this$fullScreenButto === void 0 ? void 0 : _this$fullScreenButto.setIcon("sap-icon://exit-full-screen");
        (_this$fullScreenButto2 = this.fullScreenButton.current) === null || _this$fullScreenButto2 === void 0 ? void 0 : _this$fullScreenButto2.setTooltip(this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MINIMIZE"));

        // Store the current location of the table to be able to move it back later
        this.nonFullScreenTableParent = this.tableAPI.getParent();
        this._originalAggregationName = await JsControlTreeModifier.getParentAggregationName(this.tableAPI);

        // Replace the current position of the table with an empty Panel as a placeholder
        this.nonFullScreenTableParent.setAggregation(this._originalAggregationName, this.tablePlaceHolderPanel);

        // Create the full screen dialog
        this.createDialog();

        // Move the table over into the content page in the dialog and open the dialog
        this.fullScreenDialogContentPage.addContent(this.tableAPI);
        this.fullScreenDialog.open();
      } else {
        var _this$fullScreenButto3, _this$fullScreenButto4;
        // change the button icon and text
        (_this$fullScreenButto3 = this.fullScreenButton.current) === null || _this$fullScreenButto3 === void 0 ? void 0 : _this$fullScreenButto3.setIcon("sap-icon://full-screen");
        (_this$fullScreenButto4 = this.fullScreenButton.current) === null || _this$fullScreenButto4 === void 0 ? void 0 : _this$fullScreenButto4.setTooltip(this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MAXIMIZE"));

        // Move the table back to the old place and close the dialog
        this.nonFullScreenTableParent.setAggregation(this._originalAggregationName, this.tableAPI);
        this.fullScreenDialog.close();
      }
    }

    /**
     * Determine a reference to the TableAPI control starting from the button.
     *
     * @function
     * @name getTableAPI
     * @returns The TableAPI
     */;
    _proto.getTableAPI = function getTableAPI() {
      let currentControl = this.fullScreenButton.current;
      do {
        currentControl = currentControl.getParent();
      } while (!currentControl.isA("sap.fe.macros.table.TableAPI"));
      return currentControl;
    }

    /**
     * Create the panel which acts as the placeholder for the table as long as it is displayed in the
     * full screen dialog.
     *
     * @function
     * @name createTablePlaceHolderPanel
     * @returns A Panel as placeholder for the table API
     */;
    _proto.createTablePlaceHolderPanel = function createTablePlaceHolderPanel() {
      const tablePlaceHolderPanel = new Panel({});
      tablePlaceHolderPanel.data("tableAPIreference", this.tableAPI);
      tablePlaceHolderPanel.data("FullScreenTablePlaceHolder", true);
      return tablePlaceHolderPanel;
    }

    /**
     * Create the full screen dialog.
     *
     * @function
     * @name createDialog
     */;
    _proto.createDialog = function createDialog() {
      if (!this.fullScreenDialog) {
        this.fullScreenDialog = new Dialog({
          showHeader: false,
          stretch: true,
          afterOpen: () => {
            this.afterDialogOpen();
          },
          beforeClose: () => {
            this.beforeDialogClose();
          },
          afterClose: () => {
            this.afterDialogClose();
          },
          endButton: this.getEndButton(),
          content: this.fullScreenDialogContentPage
        });
        // The below is needed for correctly setting the focus after adding a new row in
        // the table in fullscreen mode
        this.fullScreenDialog.data("FullScreenDialog", true);
      }
    }

    /**
     * Create the full screen dialog close button.
     *
     * @function
     * @name getEndButton
     * @returns The button control
     */;
    _proto.getEndButton = function getEndButton() {
      return new Button({
        text: this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_CLOSE"),
        type: ButtonType.Transparent,
        press: () => {
          // Just close the dialog here, all the needed processing is triggered
          // in beforeClose.
          // This ensures, that we only do it once event if the user presses the
          // ESC key and the Close button simultaneously
          this.fullScreenDialog.close();
        }
      });
    }

    /**
     * Set the focus back to the full screen button after opening the dialog.
     *
     * @function
     * @name afterDialogOpen
     */;
    _proto.afterDialogOpen = function afterDialogOpen() {
      var _this$fullScreenButto5;
      (_this$fullScreenButto5 = this.fullScreenButton.current) === null || _this$fullScreenButto5 === void 0 ? void 0 : _this$fullScreenButto5.focus();
    }

    /**
     * Handle dialog close via Esc. navigation etc.
     *
     * @function
     * @name beforeDialogClose
     */;
    _proto.beforeDialogClose = function beforeDialogClose() {
      // In case fullscreen dialog was closed due to navigation to another page/view/app, "Esc" click, etc. The dialog close
      // would be triggered externally and we need to clean up and move the table back to the old location
      if (this.tableAPI && this.enteringFullScreen) {
        this.onFullScreenToggle();
      }
    }

    /**
     * Some follow up after closing the dialog.
     *
     * @function
     * @name afterDialogClose
     */;
    _proto.afterDialogClose = function afterDialogClose() {
      var _this$fullScreenButto6;
      const component = Component.getOwnerComponentFor(this.tableAPI);
      const appComponent = Component.getOwnerComponentFor(component);
      (_this$fullScreenButto6 = this.fullScreenButton.current) === null || _this$fullScreenButto6 === void 0 ? void 0 : _this$fullScreenButto6.focus();
      // trigger the automatic scroll to the latest navigated row :
      appComponent.getRootViewController().getView().getController()._scrollTablesToLastNavigatedItems();
    }

    /**
     * The building block render function.
     *
     * @function
     * @name getContent
     * @returns An XML-based string with the definition of the full screen button
     */;
    _proto.getContent = function getContent() {
      return _jsx(Button, {
        ref: this.fullScreenButton,
        id: this.id,
        tooltip: this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MAXIMIZE"),
        icon: "sap-icon://full-screen",
        press: () => this.onFullScreenToggle(),
        type: "Transparent",
        visible: true,
        enabled: true
      });
    };
    return TableFullScreenDialogBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fullScreenButton", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = TableFullScreenDialogBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25UeXBlIiwibUxpYnJhcnkiLCJUYWJsZUZ1bGxTY3JlZW5EaWFsb2dCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJyZXF1aXJlZCIsImRlZmluZVJlZmVyZW5jZSIsInByb3BzIiwiZnVsbFNjcmVlbkRpYWxvZ0NvbnRlbnRQYWdlIiwiUGFnZSIsImVudGVyaW5nRnVsbFNjcmVlbiIsIm1lc3NhZ2VCdW5kbGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwib25GdWxsU2NyZWVuVG9nZ2xlIiwidGFibGVBUEkiLCJnZXRUYWJsZUFQSSIsInRhYmxlUGxhY2VIb2xkZXJQYW5lbCIsImNyZWF0ZVRhYmxlUGxhY2VIb2xkZXJQYW5lbCIsImZ1bGxTY3JlZW5CdXR0b24iLCJjdXJyZW50Iiwic2V0SWNvbiIsInNldFRvb2x0aXAiLCJnZXRUZXh0Iiwibm9uRnVsbFNjcmVlblRhYmxlUGFyZW50IiwiZ2V0UGFyZW50IiwiX29yaWdpbmFsQWdncmVnYXRpb25OYW1lIiwiSnNDb250cm9sVHJlZU1vZGlmaWVyIiwiZ2V0UGFyZW50QWdncmVnYXRpb25OYW1lIiwic2V0QWdncmVnYXRpb24iLCJjcmVhdGVEaWFsb2ciLCJhZGRDb250ZW50IiwiZnVsbFNjcmVlbkRpYWxvZyIsIm9wZW4iLCJjbG9zZSIsImN1cnJlbnRDb250cm9sIiwiaXNBIiwiUGFuZWwiLCJkYXRhIiwiRGlhbG9nIiwic2hvd0hlYWRlciIsInN0cmV0Y2giLCJhZnRlck9wZW4iLCJhZnRlckRpYWxvZ09wZW4iLCJiZWZvcmVDbG9zZSIsImJlZm9yZURpYWxvZ0Nsb3NlIiwiYWZ0ZXJDbG9zZSIsImFmdGVyRGlhbG9nQ2xvc2UiLCJlbmRCdXR0b24iLCJnZXRFbmRCdXR0b24iLCJjb250ZW50IiwiQnV0dG9uIiwidGV4dCIsIlRyYW5zcGFyZW50IiwicHJlc3MiLCJmb2N1cyIsImNvbXBvbmVudCIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwiYXBwQ29tcG9uZW50IiwiZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwiZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJfc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMiLCJnZXRDb250ZW50IiwiaWQiLCJSdW50aW1lQnVpbGRpbmdCbG9jayJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVGFibGVGdWxsU2NyZWVuRGlhbG9nLmJsb2NrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9SdW50aW1lQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGRlZmluZVJlZmVyZW5jZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgUmVmIH0gZnJvbSBcInNhcC9mZS9jb3JlL2pzeC1ydW50aW1lL2pzeFwiO1xuaW1wb3J0IFRhYmxlQVBJIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1RhYmxlQVBJXCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IG1MaWJyYXJ5IGZyb20gXCJzYXAvbS9saWJyYXJ5XCI7XG5pbXBvcnQgUGFnZSBmcm9tIFwic2FwL20vUGFnZVwiO1xuaW1wb3J0IFBhbmVsIGZyb20gXCJzYXAvbS9QYW5lbFwiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgeyBKc0NvbnRyb2xUcmVlTW9kaWZpZXIgfSBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9yZWZsZWN0aW9uXCI7XG5cbmNvbnN0IEJ1dHRvblR5cGUgPSBtTGlicmFyeS5CdXR0b25UeXBlO1xuXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiVGFibGVGdWxsU2NyZWVuRGlhbG9nXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLnRhYmxlXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJsZUZ1bGxTY3JlZW5EaWFsb2dCbG9jayBleHRlbmRzIFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIHtcblx0Y29uc3RydWN0b3IocHJvcHM6IFByb3BlcnRpZXNPZjxUYWJsZUZ1bGxTY3JlZW5EaWFsb2dCbG9jaz4pIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cdFx0dGhpcy5lbnRlcmluZ0Z1bGxTY3JlZW4gPSBmYWxzZTtcblx0XHR0aGlzLm1lc3NhZ2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG5cdH1cblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSwgcmVxdWlyZWQ6IHRydWUgfSlcblx0cHVibGljIGlkITogc3RyaW5nO1xuXG5cdEBkZWZpbmVSZWZlcmVuY2UoKVxuXHRmdWxsU2NyZWVuQnV0dG9uITogUmVmPEJ1dHRvbj47XG5cblx0dGFibGVBUEkhOiBUYWJsZUFQSTtcblxuXHRtZXNzYWdlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZTtcblxuXHRmdWxsU2NyZWVuRGlhbG9nITogRGlhbG9nO1xuXG5cdGVudGVyaW5nRnVsbFNjcmVlbjogYm9vbGVhbjtcblxuXHRub25GdWxsU2NyZWVuVGFibGVQYXJlbnQhOiBNYW5hZ2VkT2JqZWN0O1xuXG5cdF9vcmlnaW5hbEFnZ3JlZ2F0aW9uTmFtZSE6IHN0cmluZztcblxuXHRmdWxsU2NyZWVuRGlhbG9nQ29udGVudFBhZ2UgPSBuZXcgUGFnZSgpO1xuXG5cdHRhYmxlUGxhY2VIb2xkZXJQYW5lbCE6IFBhbmVsO1xuXG5cdC8qKlxuXHQgKiBNYWluIGhhbmRsZXIgZm9yIHN3aXRjaGluZyBiZXR3ZWVuIGZ1bGwgc2NyZWVuIGRpYWxvZyBhbmQgbm9ybWFsIGRpc3BsYXkuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBvbkZ1bGxTY3JlZW5Ub2dnbGVcblx0ICovXG5cdHB1YmxpYyBhc3luYyBvbkZ1bGxTY3JlZW5Ub2dnbGUoKSB7XG5cdFx0dGhpcy5lbnRlcmluZ0Z1bGxTY3JlZW4gPSAhdGhpcy5lbnRlcmluZ0Z1bGxTY3JlZW47XG5cdFx0dGhpcy50YWJsZUFQSSA9IHRoaXMuZ2V0VGFibGVBUEkoKTtcblx0XHRpZiAoIXRoaXMudGFibGVQbGFjZUhvbGRlclBhbmVsKSB7XG5cdFx0XHR0aGlzLnRhYmxlUGxhY2VIb2xkZXJQYW5lbCA9IHRoaXMuY3JlYXRlVGFibGVQbGFjZUhvbGRlclBhbmVsKCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuZW50ZXJpbmdGdWxsU2NyZWVuKSB7XG5cdFx0XHQvLyBjaGFuZ2UgdGhlIGJ1dHRvbiBpY29uIGFuZCB0ZXh0XG5cdFx0XHR0aGlzLmZ1bGxTY3JlZW5CdXR0b24uY3VycmVudD8uc2V0SWNvbihcInNhcC1pY29uOi8vZXhpdC1mdWxsLXNjcmVlblwiKTtcblx0XHRcdHRoaXMuZnVsbFNjcmVlbkJ1dHRvbi5jdXJyZW50Py5zZXRUb29sdGlwKHRoaXMubWVzc2FnZUJ1bmRsZS5nZXRUZXh0KFwiTV9DT01NT05fVEFCTEVfRlVMTFNDUkVFTl9NSU5JTUlaRVwiKSk7XG5cblx0XHRcdC8vIFN0b3JlIHRoZSBjdXJyZW50IGxvY2F0aW9uIG9mIHRoZSB0YWJsZSB0byBiZSBhYmxlIHRvIG1vdmUgaXQgYmFjayBsYXRlclxuXHRcdFx0dGhpcy5ub25GdWxsU2NyZWVuVGFibGVQYXJlbnQgPSB0aGlzLnRhYmxlQVBJLmdldFBhcmVudCgpITtcblx0XHRcdHRoaXMuX29yaWdpbmFsQWdncmVnYXRpb25OYW1lID0gYXdhaXQgSnNDb250cm9sVHJlZU1vZGlmaWVyLmdldFBhcmVudEFnZ3JlZ2F0aW9uTmFtZSh0aGlzLnRhYmxlQVBJKTtcblxuXHRcdFx0Ly8gUmVwbGFjZSB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgdGFibGUgd2l0aCBhbiBlbXB0eSBQYW5lbCBhcyBhIHBsYWNlaG9sZGVyXG5cdFx0XHR0aGlzLm5vbkZ1bGxTY3JlZW5UYWJsZVBhcmVudC5zZXRBZ2dyZWdhdGlvbih0aGlzLl9vcmlnaW5hbEFnZ3JlZ2F0aW9uTmFtZSwgdGhpcy50YWJsZVBsYWNlSG9sZGVyUGFuZWwpO1xuXG5cdFx0XHQvLyBDcmVhdGUgdGhlIGZ1bGwgc2NyZWVuIGRpYWxvZ1xuXHRcdFx0dGhpcy5jcmVhdGVEaWFsb2coKTtcblxuXHRcdFx0Ly8gTW92ZSB0aGUgdGFibGUgb3ZlciBpbnRvIHRoZSBjb250ZW50IHBhZ2UgaW4gdGhlIGRpYWxvZyBhbmQgb3BlbiB0aGUgZGlhbG9nXG5cdFx0XHR0aGlzLmZ1bGxTY3JlZW5EaWFsb2dDb250ZW50UGFnZS5hZGRDb250ZW50KHRoaXMudGFibGVBUEkpO1xuXHRcdFx0dGhpcy5mdWxsU2NyZWVuRGlhbG9nLm9wZW4oKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY2hhbmdlIHRoZSBidXR0b24gaWNvbiBhbmQgdGV4dFxuXHRcdFx0dGhpcy5mdWxsU2NyZWVuQnV0dG9uLmN1cnJlbnQ/LnNldEljb24oXCJzYXAtaWNvbjovL2Z1bGwtc2NyZWVuXCIpO1xuXHRcdFx0dGhpcy5mdWxsU2NyZWVuQnV0dG9uLmN1cnJlbnQ/LnNldFRvb2x0aXAodGhpcy5tZXNzYWdlQnVuZGxlLmdldFRleHQoXCJNX0NPTU1PTl9UQUJMRV9GVUxMU0NSRUVOX01BWElNSVpFXCIpKTtcblxuXHRcdFx0Ly8gTW92ZSB0aGUgdGFibGUgYmFjayB0byB0aGUgb2xkIHBsYWNlIGFuZCBjbG9zZSB0aGUgZGlhbG9nXG5cdFx0XHR0aGlzLm5vbkZ1bGxTY3JlZW5UYWJsZVBhcmVudC5zZXRBZ2dyZWdhdGlvbih0aGlzLl9vcmlnaW5hbEFnZ3JlZ2F0aW9uTmFtZSwgdGhpcy50YWJsZUFQSSk7XG5cdFx0XHR0aGlzLmZ1bGxTY3JlZW5EaWFsb2cuY2xvc2UoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGV0ZXJtaW5lIGEgcmVmZXJlbmNlIHRvIHRoZSBUYWJsZUFQSSBjb250cm9sIHN0YXJ0aW5nIGZyb20gdGhlIGJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFRhYmxlQVBJXG5cdCAqIEByZXR1cm5zIFRoZSBUYWJsZUFQSVxuXHQgKi9cblx0cHJpdmF0ZSBnZXRUYWJsZUFQSSgpOiBUYWJsZUFQSSB7XG5cdFx0bGV0IGN1cnJlbnRDb250cm9sOiBDb250cm9sID0gdGhpcy5mdWxsU2NyZWVuQnV0dG9uLmN1cnJlbnQgYXMgQ29udHJvbDtcblx0XHRkbyB7XG5cdFx0XHRjdXJyZW50Q29udHJvbCA9IGN1cnJlbnRDb250cm9sLmdldFBhcmVudCgpIGFzIENvbnRyb2w7XG5cdFx0fSB3aGlsZSAoIWN1cnJlbnRDb250cm9sLmlzQShcInNhcC5mZS5tYWNyb3MudGFibGUuVGFibGVBUElcIikpO1xuXHRcdHJldHVybiBjdXJyZW50Q29udHJvbCBhcyBUYWJsZUFQSTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIHBhbmVsIHdoaWNoIGFjdHMgYXMgdGhlIHBsYWNlaG9sZGVyIGZvciB0aGUgdGFibGUgYXMgbG9uZyBhcyBpdCBpcyBkaXNwbGF5ZWQgaW4gdGhlXG5cdCAqIGZ1bGwgc2NyZWVuIGRpYWxvZy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGNyZWF0ZVRhYmxlUGxhY2VIb2xkZXJQYW5lbFxuXHQgKiBAcmV0dXJucyBBIFBhbmVsIGFzIHBsYWNlaG9sZGVyIGZvciB0aGUgdGFibGUgQVBJXG5cdCAqL1xuXHRwcml2YXRlIGNyZWF0ZVRhYmxlUGxhY2VIb2xkZXJQYW5lbCgpOiBQYW5lbCB7XG5cdFx0Y29uc3QgdGFibGVQbGFjZUhvbGRlclBhbmVsID0gbmV3IFBhbmVsKHt9KTtcblx0XHR0YWJsZVBsYWNlSG9sZGVyUGFuZWwuZGF0YShcInRhYmxlQVBJcmVmZXJlbmNlXCIsIHRoaXMudGFibGVBUEkpO1xuXHRcdHRhYmxlUGxhY2VIb2xkZXJQYW5lbC5kYXRhKFwiRnVsbFNjcmVlblRhYmxlUGxhY2VIb2xkZXJcIiwgdHJ1ZSk7XG5cdFx0cmV0dXJuIHRhYmxlUGxhY2VIb2xkZXJQYW5lbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIGZ1bGwgc2NyZWVuIGRpYWxvZy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGNyZWF0ZURpYWxvZ1xuXHQgKi9cblx0cHJpdmF0ZSBjcmVhdGVEaWFsb2coKSB7XG5cdFx0aWYgKCF0aGlzLmZ1bGxTY3JlZW5EaWFsb2cpIHtcblx0XHRcdHRoaXMuZnVsbFNjcmVlbkRpYWxvZyA9IG5ldyBEaWFsb2coe1xuXHRcdFx0XHRzaG93SGVhZGVyOiBmYWxzZSxcblx0XHRcdFx0c3RyZXRjaDogdHJ1ZSxcblx0XHRcdFx0YWZ0ZXJPcGVuOiAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5hZnRlckRpYWxvZ09wZW4oKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0YmVmb3JlQ2xvc2U6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLmJlZm9yZURpYWxvZ0Nsb3NlKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFmdGVyQ2xvc2U6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLmFmdGVyRGlhbG9nQ2xvc2UoKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZW5kQnV0dG9uOiB0aGlzLmdldEVuZEJ1dHRvbigpLFxuXHRcdFx0XHRjb250ZW50OiB0aGlzLmZ1bGxTY3JlZW5EaWFsb2dDb250ZW50UGFnZVxuXHRcdFx0fSk7XG5cdFx0XHQvLyBUaGUgYmVsb3cgaXMgbmVlZGVkIGZvciBjb3JyZWN0bHkgc2V0dGluZyB0aGUgZm9jdXMgYWZ0ZXIgYWRkaW5nIGEgbmV3IHJvdyBpblxuXHRcdFx0Ly8gdGhlIHRhYmxlIGluIGZ1bGxzY3JlZW4gbW9kZVxuXHRcdFx0dGhpcy5mdWxsU2NyZWVuRGlhbG9nLmRhdGEoXCJGdWxsU2NyZWVuRGlhbG9nXCIsIHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIGZ1bGwgc2NyZWVuIGRpYWxvZyBjbG9zZSBidXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRFbmRCdXR0b25cblx0ICogQHJldHVybnMgVGhlIGJ1dHRvbiBjb250cm9sXG5cdCAqL1xuXHRwcml2YXRlIGdldEVuZEJ1dHRvbigpIHtcblx0XHRyZXR1cm4gbmV3IEJ1dHRvbih7XG5cdFx0XHR0ZXh0OiB0aGlzLm1lc3NhZ2VCdW5kbGUuZ2V0VGV4dChcIk1fQ09NTU9OX1RBQkxFX0ZVTExTQ1JFRU5fQ0xPU0VcIiksXG5cdFx0XHR0eXBlOiBCdXR0b25UeXBlLlRyYW5zcGFyZW50LFxuXHRcdFx0cHJlc3M6ICgpID0+IHtcblx0XHRcdFx0Ly8gSnVzdCBjbG9zZSB0aGUgZGlhbG9nIGhlcmUsIGFsbCB0aGUgbmVlZGVkIHByb2Nlc3NpbmcgaXMgdHJpZ2dlcmVkXG5cdFx0XHRcdC8vIGluIGJlZm9yZUNsb3NlLlxuXHRcdFx0XHQvLyBUaGlzIGVuc3VyZXMsIHRoYXQgd2Ugb25seSBkbyBpdCBvbmNlIGV2ZW50IGlmIHRoZSB1c2VyIHByZXNzZXMgdGhlXG5cdFx0XHRcdC8vIEVTQyBrZXkgYW5kIHRoZSBDbG9zZSBidXR0b24gc2ltdWx0YW5lb3VzbHlcblx0XHRcdFx0dGhpcy5mdWxsU2NyZWVuRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBmb2N1cyBiYWNrIHRvIHRoZSBmdWxsIHNjcmVlbiBidXR0b24gYWZ0ZXIgb3BlbmluZyB0aGUgZGlhbG9nLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgYWZ0ZXJEaWFsb2dPcGVuXG5cdCAqL1xuXHRwcml2YXRlIGFmdGVyRGlhbG9nT3BlbigpIHtcblx0XHR0aGlzLmZ1bGxTY3JlZW5CdXR0b24uY3VycmVudD8uZm9jdXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgZGlhbG9nIGNsb3NlIHZpYSBFc2MuIG5hdmlnYXRpb24gZXRjLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgYmVmb3JlRGlhbG9nQ2xvc2Vcblx0ICovXG5cdHByaXZhdGUgYmVmb3JlRGlhbG9nQ2xvc2UoKSB7XG5cdFx0Ly8gSW4gY2FzZSBmdWxsc2NyZWVuIGRpYWxvZyB3YXMgY2xvc2VkIGR1ZSB0byBuYXZpZ2F0aW9uIHRvIGFub3RoZXIgcGFnZS92aWV3L2FwcCwgXCJFc2NcIiBjbGljaywgZXRjLiBUaGUgZGlhbG9nIGNsb3NlXG5cdFx0Ly8gd291bGQgYmUgdHJpZ2dlcmVkIGV4dGVybmFsbHkgYW5kIHdlIG5lZWQgdG8gY2xlYW4gdXAgYW5kIG1vdmUgdGhlIHRhYmxlIGJhY2sgdG8gdGhlIG9sZCBsb2NhdGlvblxuXHRcdGlmICh0aGlzLnRhYmxlQVBJICYmIHRoaXMuZW50ZXJpbmdGdWxsU2NyZWVuKSB7XG5cdFx0XHR0aGlzLm9uRnVsbFNjcmVlblRvZ2dsZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTb21lIGZvbGxvdyB1cCBhZnRlciBjbG9zaW5nIHRoZSBkaWFsb2cuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBhZnRlckRpYWxvZ0Nsb3NlXG5cdCAqL1xuXHRwcml2YXRlIGFmdGVyRGlhbG9nQ2xvc2UoKSB7XG5cdFx0Y29uc3QgY29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKHRoaXMudGFibGVBUEkpITtcblx0XHRjb25zdCBhcHBDb21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3IoY29tcG9uZW50KSBhcyBBcHBDb21wb25lbnQ7XG5cdFx0dGhpcy5mdWxsU2NyZWVuQnV0dG9uLmN1cnJlbnQ/LmZvY3VzKCk7XG5cdFx0Ly8gdHJpZ2dlciB0aGUgYXV0b21hdGljIHNjcm9sbCB0byB0aGUgbGF0ZXN0IG5hdmlnYXRlZCByb3cgOlxuXHRcdChhcHBDb21wb25lbnQuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLl9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayByZW5kZXIgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRDb250ZW50XG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZnVsbCBzY3JlZW4gYnV0dG9uXG5cdCAqL1xuXHRnZXRDb250ZW50KCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdHJlZj17dGhpcy5mdWxsU2NyZWVuQnV0dG9ufVxuXHRcdFx0XHRpZD17dGhpcy5pZH1cblx0XHRcdFx0dG9vbHRpcD17dGhpcy5tZXNzYWdlQnVuZGxlLmdldFRleHQoXCJNX0NPTU1PTl9UQUJMRV9GVUxMU0NSRUVOX01BWElNSVpFXCIpfVxuXHRcdFx0XHRpY29uPXtcInNhcC1pY29uOi8vZnVsbC1zY3JlZW5cIn1cblx0XHRcdFx0cHJlc3M9eygpID0+IHRoaXMub25GdWxsU2NyZWVuVG9nZ2xlKCl9XG5cdFx0XHRcdHR5cGU9e1wiVHJhbnNwYXJlbnRcIn1cblx0XHRcdFx0dmlzaWJsZT17dHJ1ZX1cblx0XHRcdFx0ZW5hYmxlZD17dHJ1ZX1cblx0XHRcdC8+XG5cdFx0KSBhcyBCdXR0b247XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O0VBbUJBLE1BQU1BLFVBQVUsR0FBR0MsUUFBUSxDQUFDRCxVQUFVO0VBQUMsSUFNbEJFLDBCQUEwQixXQUo5Q0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSx1QkFBdUI7SUFDN0JDLFNBQVMsRUFBRTtFQUNaLENBQUMsQ0FBQyxVQVFBQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFLElBQUk7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBR2xFQyxlQUFlLEVBQUU7SUFBQTtJQVRsQixvQ0FBWUMsS0FBK0MsRUFBRTtNQUFBO01BQzVELHlDQUFNQSxLQUFLLENBQUM7TUFBQztNQUFBO01BQUEsTUF1QmRDLDJCQUEyQixHQUFHLElBQUlDLElBQUksRUFBRTtNQXRCdkMsTUFBS0Msa0JBQWtCLEdBQUcsS0FBSztNQUMvQixNQUFLQyxhQUFhLEdBQUdDLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsZUFBZSxDQUFDO01BQUM7SUFDckU7SUFBQztJQUFBO0lBd0JEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUxDLE9BTWFDLGtCQUFrQixHQUEvQixvQ0FBa0M7TUFDakMsSUFBSSxDQUFDSixrQkFBa0IsR0FBRyxDQUFDLElBQUksQ0FBQ0Esa0JBQWtCO01BQ2xELElBQUksQ0FBQ0ssUUFBUSxHQUFHLElBQUksQ0FBQ0MsV0FBVyxFQUFFO01BQ2xD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