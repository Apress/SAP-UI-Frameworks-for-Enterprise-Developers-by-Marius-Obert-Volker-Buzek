/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/CommonUtils", "sap/fe/core/controls/CommandExecution", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ClassSupport", "sap/m/Menu", "sap/m/MenuButton", "sap/m/MenuItem", "sap/suite/ui/commons/collaboration/CollaborationHelper", "sap/suite/ui/commons/collaboration/ServiceContainer", "sap/ui/core/CustomData", "sap/ui/performance/trace/FESRHelper", "sap/ushell/ui/footerbar/AddBookmarkButton", "./ShareAPI", "sap/fe/core/jsx-runtime/jsx"], function (Log, BuildingBlockSupport, RuntimeBuildingBlock, CommonUtils, CommandExecution, BindingToolkit, ClassSupport, Menu, MenuButton, MenuItem, CollaborationHelper, ServiceContainer, CustomData, FESRHelper, AddBookmarkButton, ShareAPI, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  var _exports = {};
  var defineReference = ClassSupport.defineReference;
  var constant = BindingToolkit.constant;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ShareBlock = (
  /**
   * Building block used to create the ‘Share’ functionality.
   * <br>
   * Please note that the 'Share in SAP Jam' option is only available on platforms that are integrated with SAP Jam.
   * <br>
   * If you are consuming this macro in an environment where the SAP Fiori launchpad is not available, then the 'Save as Tile' option is not visible.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Share
   * 	id="someID"
   *	visible="true"
   * /&gt;
   * </pre>
   *
   * @hideconstructor
   * @since 1.93.0
   */
  _dec = defineBuildingBlock({
    name: "Share",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    required: true,
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "boolean",
    isPublic: true,
    bindable: true
  }), _dec4 = defineReference(), _dec5 = defineReference(), _dec6 = defineReference(), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(ShareBlock, _RuntimeBuildingBlock);
    function ShareBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _RuntimeBuildingBlock.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menuButton", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menu", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "saveAsTileMenuItem", _descriptor5, _assertThisInitialized(_this));
      return _this;
    }
    _exports = ShareBlock;
    var _proto = ShareBlock.prototype;
    /**
     * Retrieves the share option from the shell configuration asynchronously and prepare the content of the menu button.
     * Options order are:
     * - Send as Email
     * - Share as Jam (if available)
     * - Teams options (if available)
     * - Save as tile.
     *
     * @param view The view this building block is used in
     * @param appComponent The AppComponent instance
     */
    _proto._initializeMenuItems = async function _initializeMenuItems(view, appComponent) {
      const isTeamsModeActive = await CollaborationHelper.isTeamsModeActive();
      if (isTeamsModeActive) {
        var _this$menuButton$curr, _this$menuButton$curr2;
        //need to clear the visible property bindings otherwise when the binding value changes then it will set back the visible to the resolved value
        (_this$menuButton$curr = this.menuButton.current) === null || _this$menuButton$curr === void 0 ? void 0 : _this$menuButton$curr.unbindProperty("visible", true);
        (_this$menuButton$curr2 = this.menuButton.current) === null || _this$menuButton$curr2 === void 0 ? void 0 : _this$menuButton$curr2.setVisible(false);
        return;
      }
      const controller = view.getController();
      const shellServices = appComponent.getShellServices();
      const isPluginInfoStable = await shellServices.waitForPluginsLoad();
      if (!isPluginInfoStable) {
        var _this$menuButton$curr3;
        // In case the plugin info is not yet available we need to do this computation again on the next button click
        const internalButton = (_this$menuButton$curr3 = this.menuButton.current) === null || _this$menuButton$curr3 === void 0 ? void 0 : _this$menuButton$curr3.getAggregation("_control");
        internalButton === null || internalButton === void 0 ? void 0 : internalButton.attachEventOnce("press", {}, () => this._initializeMenuItems, this);
      }
      if (this.menu.current) {
        this.menu.current.addItem(_jsx(MenuItem, {
          text: this.getTranslatedText("T_SEMANTIC_CONTROL_SEND_EMAIL"),
          icon: "sap-icon://email",
          press: () => controller.share._triggerEmail()
        }));
        this._addShellBasedMenuItems(controller, shellServices);
      }
    };
    _proto._addShellBasedMenuItems = async function _addShellBasedMenuItems(controller, shellServices) {
      var _shellServices$getUse, _shellServices$getUse2;
      const hasUshell = shellServices.hasUShell();
      const hasJam = !!((_shellServices$getUse = (_shellServices$getUse2 = shellServices.getUser()).isJamActive) !== null && _shellServices$getUse !== void 0 && _shellServices$getUse.call(_shellServices$getUse2));
      const collaborationTeamsHelper = await ServiceContainer.getServiceAsync();
      const shareCollaborationOptions = collaborationTeamsHelper.getOptions();
      if (hasUshell) {
        if (hasJam) {
          var _this$menu, _this$menu$current;
          this === null || this === void 0 ? void 0 : (_this$menu = this.menu) === null || _this$menu === void 0 ? void 0 : (_this$menu$current = _this$menu.current) === null || _this$menu$current === void 0 ? void 0 : _this$menu$current.addItem(_jsx(MenuItem, {
            text: this.getTranslatedText("T_COMMON_SAPFE_SHARE_JAM"),
            icon: "sap-icon://share-2",
            press: () => controller.share._triggerShareToJam()
          }));
        }
        // prepare teams menu items
        for (const collaborationOption of shareCollaborationOptions) {
          var _collaborationOption$, _this$menu2, _this$menu2$current;
          const menuItemSettings = {
            text: collaborationOption.text,
            icon: collaborationOption.icon,
            items: []
          };
          if (collaborationOption !== null && collaborationOption !== void 0 && collaborationOption.subOptions && (collaborationOption === null || collaborationOption === void 0 ? void 0 : (_collaborationOption$ = collaborationOption.subOptions) === null || _collaborationOption$ === void 0 ? void 0 : _collaborationOption$.length) > 0) {
            menuItemSettings.items = [];
            collaborationOption.subOptions.forEach(subOption => {
              const subMenuItem = new MenuItem({
                text: subOption.text,
                icon: subOption.icon,
                press: this.collaborationMenuItemPress,
                customData: new CustomData({
                  key: "collaborationData",
                  value: subOption
                })
              });
              if (subOption.fesrStepName) {
                FESRHelper.setSemanticStepname(subMenuItem, "press", subOption.fesrStepName);
              }
              menuItemSettings.items.push(subMenuItem);
            });
          } else {
            // if there are no sub option then the main option should be clickable
            // so add a press handler.
            menuItemSettings.press = this.collaborationMenuItemPress;
            menuItemSettings["customData"] = new CustomData({
              key: "collaborationData",
              value: collaborationOption
            });
          }
          const menuItem = new MenuItem(menuItemSettings);
          if (menuItemSettings.press && collaborationOption.fesrStepName) {
            FESRHelper.setSemanticStepname(menuItem, "press", collaborationOption.fesrStepName);
          }
          this === null || this === void 0 ? void 0 : (_this$menu2 = this.menu) === null || _this$menu2 === void 0 ? void 0 : (_this$menu2$current = _this$menu2.current) === null || _this$menu2$current === void 0 ? void 0 : _this$menu2$current.addItem(menuItem);
        }
        // set save as tile
        // for now we need to create addBookmarkButton to use the save as tile feature.
        // In the future save as tile should be available as an API or a MenuItem so that it can be added to the Menu button.
        // This needs to be discussed with AddBookmarkButton team.
        const addBookmarkButton = new AddBookmarkButton();
        if (addBookmarkButton.getEnabled()) {
          var _this$menu3, _this$menu3$current;
          this === null || this === void 0 ? void 0 : (_this$menu3 = this.menu) === null || _this$menu3 === void 0 ? void 0 : (_this$menu3$current = _this$menu3.current) === null || _this$menu3$current === void 0 ? void 0 : _this$menu3$current.addItem(_jsx(MenuItem, {
            ref: this.saveAsTileMenuItem,
            text: addBookmarkButton.getText(),
            icon: addBookmarkButton.getIcon(),
            press: () => controller.share._saveAsTile(this.saveAsTileMenuItem.current),
            children: {
              dependents: [addBookmarkButton]
            }
          }));
        } else {
          addBookmarkButton.destroy();
        }
      }
    };
    _proto.collaborationMenuItemPress = async function collaborationMenuItemPress(event) {
      const clickedMenuItem = event.getSource();
      const collaborationTeamsHelper = await ServiceContainer.getServiceAsync();
      const view = CommonUtils.getTargetView(clickedMenuItem);
      const controller = view.getController();
      // call adapt share metadata so that the collaboration info model is updated with the required info
      await controller.share._adaptShareMetadata();
      const collaborationInfo = view.getModel("collaborationInfo").getData();
      collaborationTeamsHelper.share(clickedMenuItem.data("collaborationData"), collaborationInfo);
    };
    _proto.getContent = function getContent(view, appComponent) {
      // Ctrl+Shift+S is needed for the time being but this needs to be removed after backlog from menu button
      const menuButton = _jsx(ShareAPI, {
        id: this.id,
        children: _jsx(MenuButton, {
          ref: this.menuButton,
          icon: "sap-icon://action",
          visible: this.visible,
          tooltip: "{sap.fe.i18n>M_COMMON_SAPFE_ACTION_SHARE} (Ctrl+Shift+S)",
          children: _jsx(Menu, {
            ref: this.menu
          })
        })
      });
      view.addDependent(_jsx(CommandExecution, {
        visible: this.visible,
        enabled: this.visible,
        command: "Share",
        execute: () => {
          var _this$menuButton$curr4;
          return (_this$menuButton$curr4 = this.menuButton.current) === null || _this$menuButton$curr4 === void 0 ? void 0 : _this$menuButton$curr4.getMenu().openBy(this.menuButton.current, true);
        }
      }));
      // The initialization is asynchronous, so we just trigger it and hope for the best :D
      this.isInitialized = this._initializeMenuItems(view, appComponent).catch(error => {
        Log.error(error);
      });
      return menuButton;
    };
    return ShareBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return constant(true);
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "menuButton", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "menu", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "saveAsTileMenuItem", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ShareBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFyZUJsb2NrIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJwdWJsaWNOYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImlzUHVibGljIiwiYmluZGFibGUiLCJkZWZpbmVSZWZlcmVuY2UiLCJfaW5pdGlhbGl6ZU1lbnVJdGVtcyIsInZpZXciLCJhcHBDb21wb25lbnQiLCJpc1RlYW1zTW9kZUFjdGl2ZSIsIkNvbGxhYm9yYXRpb25IZWxwZXIiLCJtZW51QnV0dG9uIiwiY3VycmVudCIsInVuYmluZFByb3BlcnR5Iiwic2V0VmlzaWJsZSIsImNvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwic2hlbGxTZXJ2aWNlcyIsImdldFNoZWxsU2VydmljZXMiLCJpc1BsdWdpbkluZm9TdGFibGUiLCJ3YWl0Rm9yUGx1Z2luc0xvYWQiLCJpbnRlcm5hbEJ1dHRvbiIsImdldEFnZ3JlZ2F0aW9uIiwiYXR0YWNoRXZlbnRPbmNlIiwibWVudSIsImFkZEl0ZW0iLCJnZXRUcmFuc2xhdGVkVGV4dCIsInNoYXJlIiwiX3RyaWdnZXJFbWFpbCIsIl9hZGRTaGVsbEJhc2VkTWVudUl0ZW1zIiwiaGFzVXNoZWxsIiwiaGFzVVNoZWxsIiwiaGFzSmFtIiwiZ2V0VXNlciIsImlzSmFtQWN0aXZlIiwiY29sbGFib3JhdGlvblRlYW1zSGVscGVyIiwiU2VydmljZUNvbnRhaW5lciIsImdldFNlcnZpY2VBc3luYyIsInNoYXJlQ29sbGFib3JhdGlvbk9wdGlvbnMiLCJnZXRPcHRpb25zIiwiX3RyaWdnZXJTaGFyZVRvSmFtIiwiY29sbGFib3JhdGlvbk9wdGlvbiIsIm1lbnVJdGVtU2V0dGluZ3MiLCJ0ZXh0IiwiaWNvbiIsIml0ZW1zIiwic3ViT3B0aW9ucyIsImxlbmd0aCIsImZvckVhY2giLCJzdWJPcHRpb24iLCJzdWJNZW51SXRlbSIsIk1lbnVJdGVtIiwicHJlc3MiLCJjb2xsYWJvcmF0aW9uTWVudUl0ZW1QcmVzcyIsImN1c3RvbURhdGEiLCJDdXN0b21EYXRhIiwia2V5IiwidmFsdWUiLCJmZXNyU3RlcE5hbWUiLCJGRVNSSGVscGVyIiwic2V0U2VtYW50aWNTdGVwbmFtZSIsInB1c2giLCJtZW51SXRlbSIsImFkZEJvb2ttYXJrQnV0dG9uIiwiQWRkQm9va21hcmtCdXR0b24iLCJnZXRFbmFibGVkIiwic2F2ZUFzVGlsZU1lbnVJdGVtIiwiZ2V0VGV4dCIsImdldEljb24iLCJfc2F2ZUFzVGlsZSIsImRlcGVuZGVudHMiLCJkZXN0cm95IiwiZXZlbnQiLCJjbGlja2VkTWVudUl0ZW0iLCJnZXRTb3VyY2UiLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJfYWRhcHRTaGFyZU1ldGFkYXRhIiwiY29sbGFib3JhdGlvbkluZm8iLCJnZXRNb2RlbCIsImdldERhdGEiLCJkYXRhIiwiZ2V0Q29udGVudCIsImlkIiwidmlzaWJsZSIsImFkZERlcGVuZGVudCIsImdldE1lbnUiLCJvcGVuQnkiLCJpc0luaXRpYWxpemVkIiwiY2F0Y2giLCJlcnJvciIsIkxvZyIsIlJ1bnRpbWVCdWlsZGluZ0Jsb2NrIiwiY29uc3RhbnQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlNoYXJlLmJsb2NrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCBSdW50aW1lQnVpbGRpbmdCbG9jayBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvUnVudGltZUJ1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBDb21tYW5kRXhlY3V0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9scy9Db21tYW5kRXhlY3V0aW9uXCI7XG5pbXBvcnQgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sIGNvbnN0YW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGRlZmluZVJlZmVyZW5jZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgUmVmIH0gZnJvbSBcInNhcC9mZS9jb3JlL2pzeC1ydW50aW1lL2pzeFwiO1xuaW1wb3J0IFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgeyBJU2hlbGxTZXJ2aWNlcyB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaGVsbFNlcnZpY2VzRmFjdG9yeVwiO1xuaW1wb3J0IE1lbnUgZnJvbSBcInNhcC9tL01lbnVcIjtcbmltcG9ydCBNZW51QnV0dG9uIGZyb20gXCJzYXAvbS9NZW51QnV0dG9uXCI7XG5pbXBvcnQgTWVudUl0ZW0sIHsgJE1lbnVJdGVtU2V0dGluZ3MgfSBmcm9tIFwic2FwL20vTWVudUl0ZW1cIjtcbmltcG9ydCBDb2xsYWJvcmF0aW9uSGVscGVyIGZyb20gXCJzYXAvc3VpdGUvdWkvY29tbW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25IZWxwZXJcIjtcbmltcG9ydCBTZXJ2aWNlQ29udGFpbmVyIGZyb20gXCJzYXAvc3VpdGUvdWkvY29tbW9ucy9jb2xsYWJvcmF0aW9uL1NlcnZpY2VDb250YWluZXJcIjtcbmltcG9ydCBUZWFtc0hlbHBlclNlcnZpY2UsIHsgQ29sbGFib3JhdGlvbk9wdGlvbnMgfSBmcm9tIFwic2FwL3N1aXRlL3VpL2NvbW1vbnMvY29sbGFib3JhdGlvbi9UZWFtc0hlbHBlclNlcnZpY2VcIjtcbmltcG9ydCBVSTVFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgQ3VzdG9tRGF0YSBmcm9tIFwic2FwL3VpL2NvcmUvQ3VzdG9tRGF0YVwiO1xuaW1wb3J0IFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBGRVNSSGVscGVyIGZyb20gXCJzYXAvdWkvcGVyZm9ybWFuY2UvdHJhY2UvRkVTUkhlbHBlclwiO1xuaW1wb3J0IEFkZEJvb2ttYXJrQnV0dG9uIGZyb20gXCJzYXAvdXNoZWxsL3VpL2Zvb3RlcmJhci9BZGRCb29rbWFya0J1dHRvblwiO1xuaW1wb3J0IFNoYXJlQVBJIGZyb20gXCIuL1NoYXJlQVBJXCI7XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgdXNlZCB0byBjcmVhdGUgdGhlIOKAmFNoYXJl4oCZIGZ1bmN0aW9uYWxpdHkuXG4gKiA8YnI+XG4gKiBQbGVhc2Ugbm90ZSB0aGF0IHRoZSAnU2hhcmUgaW4gU0FQIEphbScgb3B0aW9uIGlzIG9ubHkgYXZhaWxhYmxlIG9uIHBsYXRmb3JtcyB0aGF0IGFyZSBpbnRlZ3JhdGVkIHdpdGggU0FQIEphbS5cbiAqIDxicj5cbiAqIElmIHlvdSBhcmUgY29uc3VtaW5nIHRoaXMgbWFjcm8gaW4gYW4gZW52aXJvbm1lbnQgd2hlcmUgdGhlIFNBUCBGaW9yaSBsYXVuY2hwYWQgaXMgbm90IGF2YWlsYWJsZSwgdGhlbiB0aGUgJ1NhdmUgYXMgVGlsZScgb3B0aW9uIGlzIG5vdCB2aXNpYmxlLlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpTaGFyZVxuICogXHRpZD1cInNvbWVJRFwiXG4gKlx0dmlzaWJsZT1cInRydWVcIlxuICogLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBzaW5jZSAxLjkzLjBcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIlNoYXJlXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIsXG5cdHB1YmxpY05hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFyZUJsb2NrIGV4dGVuZHMgUnVudGltZUJ1aWxkaW5nQmxvY2sge1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0aWQhOiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRiaW5kYWJsZTogdHJ1ZVxuXHR9KVxuXHR2aXNpYmxlOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gPSBjb25zdGFudCh0cnVlKTtcblxuXHRAZGVmaW5lUmVmZXJlbmNlKClcblx0bWVudUJ1dHRvbiE6IFJlZjxNZW51QnV0dG9uPjtcblxuXHRAZGVmaW5lUmVmZXJlbmNlKClcblx0bWVudSE6IFJlZjxNZW51PjtcblxuXHRAZGVmaW5lUmVmZXJlbmNlKClcblx0c2F2ZUFzVGlsZU1lbnVJdGVtITogUmVmPE1lbnVJdGVtPjtcblxuXHRwdWJsaWMgaXNJbml0aWFsaXplZD86IFByb21pc2U8dm9pZD47XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgc2hhcmUgb3B0aW9uIGZyb20gdGhlIHNoZWxsIGNvbmZpZ3VyYXRpb24gYXN5bmNocm9ub3VzbHkgYW5kIHByZXBhcmUgdGhlIGNvbnRlbnQgb2YgdGhlIG1lbnUgYnV0dG9uLlxuXHQgKiBPcHRpb25zIG9yZGVyIGFyZTpcblx0ICogLSBTZW5kIGFzIEVtYWlsXG5cdCAqIC0gU2hhcmUgYXMgSmFtIChpZiBhdmFpbGFibGUpXG5cdCAqIC0gVGVhbXMgb3B0aW9ucyAoaWYgYXZhaWxhYmxlKVxuXHQgKiAtIFNhdmUgYXMgdGlsZS5cblx0ICpcblx0ICogQHBhcmFtIHZpZXcgVGhlIHZpZXcgdGhpcyBidWlsZGluZyBibG9jayBpcyB1c2VkIGluXG5cdCAqIEBwYXJhbSBhcHBDb21wb25lbnQgVGhlIEFwcENvbXBvbmVudCBpbnN0YW5jZVxuXHQgKi9cblx0YXN5bmMgX2luaXRpYWxpemVNZW51SXRlbXModmlldzogVmlldywgYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRjb25zdCBpc1RlYW1zTW9kZUFjdGl2ZSA9IGF3YWl0IENvbGxhYm9yYXRpb25IZWxwZXIuaXNUZWFtc01vZGVBY3RpdmUoKTtcblx0XHRpZiAoaXNUZWFtc01vZGVBY3RpdmUpIHtcblx0XHRcdC8vbmVlZCB0byBjbGVhciB0aGUgdmlzaWJsZSBwcm9wZXJ0eSBiaW5kaW5ncyBvdGhlcndpc2Ugd2hlbiB0aGUgYmluZGluZyB2YWx1ZSBjaGFuZ2VzIHRoZW4gaXQgd2lsbCBzZXQgYmFjayB0aGUgdmlzaWJsZSB0byB0aGUgcmVzb2x2ZWQgdmFsdWVcblx0XHRcdHRoaXMubWVudUJ1dHRvbi5jdXJyZW50Py51bmJpbmRQcm9wZXJ0eShcInZpc2libGVcIiwgdHJ1ZSk7XG5cdFx0XHR0aGlzLm1lbnVCdXR0b24uY3VycmVudD8uc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IGNvbnRyb2xsZXIgPSB2aWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcjtcblx0XHRjb25zdCBzaGVsbFNlcnZpY2VzID0gYXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKTtcblx0XHRjb25zdCBpc1BsdWdpbkluZm9TdGFibGUgPSBhd2FpdCBzaGVsbFNlcnZpY2VzLndhaXRGb3JQbHVnaW5zTG9hZCgpO1xuXHRcdGlmICghaXNQbHVnaW5JbmZvU3RhYmxlKSB7XG5cdFx0XHQvLyBJbiBjYXNlIHRoZSBwbHVnaW4gaW5mbyBpcyBub3QgeWV0IGF2YWlsYWJsZSB3ZSBuZWVkIHRvIGRvIHRoaXMgY29tcHV0YXRpb24gYWdhaW4gb24gdGhlIG5leHQgYnV0dG9uIGNsaWNrXG5cdFx0XHRjb25zdCBpbnRlcm5hbEJ1dHRvbiA9IHRoaXMubWVudUJ1dHRvbi5jdXJyZW50Py5nZXRBZ2dyZWdhdGlvbihcIl9jb250cm9sXCIpIGFzIE1hbmFnZWRPYmplY3Q7XG5cdFx0XHRpbnRlcm5hbEJ1dHRvbj8uYXR0YWNoRXZlbnRPbmNlKFwicHJlc3NcIiwge30sICgpID0+IHRoaXMuX2luaXRpYWxpemVNZW51SXRlbXMsIHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLm1lbnUuY3VycmVudCkge1xuXHRcdFx0dGhpcy5tZW51LmN1cnJlbnQuYWRkSXRlbShcblx0XHRcdFx0PE1lbnVJdGVtXG5cdFx0XHRcdFx0dGV4dD17dGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIlRfU0VNQU5USUNfQ09OVFJPTF9TRU5EX0VNQUlMXCIpfVxuXHRcdFx0XHRcdGljb249e1wic2FwLWljb246Ly9lbWFpbFwifVxuXHRcdFx0XHRcdHByZXNzPXsoKSA9PiBjb250cm9sbGVyLnNoYXJlLl90cmlnZ2VyRW1haWwoKX1cblx0XHRcdFx0Lz5cblx0XHRcdCk7XG5cdFx0XHR0aGlzLl9hZGRTaGVsbEJhc2VkTWVudUl0ZW1zKGNvbnRyb2xsZXIsIHNoZWxsU2VydmljZXMpO1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIF9hZGRTaGVsbEJhc2VkTWVudUl0ZW1zKGNvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLCBzaGVsbFNlcnZpY2VzOiBJU2hlbGxTZXJ2aWNlcykge1xuXHRcdGNvbnN0IGhhc1VzaGVsbCA9IHNoZWxsU2VydmljZXMuaGFzVVNoZWxsKCk7XG5cdFx0Y29uc3QgaGFzSmFtID0gISFzaGVsbFNlcnZpY2VzLmdldFVzZXIoKS5pc0phbUFjdGl2ZT8uKCk7XG5cblx0XHRjb25zdCBjb2xsYWJvcmF0aW9uVGVhbXNIZWxwZXI6IFRlYW1zSGVscGVyU2VydmljZSA9IGF3YWl0IFNlcnZpY2VDb250YWluZXIuZ2V0U2VydmljZUFzeW5jKCk7XG5cdFx0Y29uc3Qgc2hhcmVDb2xsYWJvcmF0aW9uT3B0aW9uczogQ29sbGFib3JhdGlvbk9wdGlvbnNbXSA9IGNvbGxhYm9yYXRpb25UZWFtc0hlbHBlci5nZXRPcHRpb25zKCk7XG5cdFx0aWYgKGhhc1VzaGVsbCkge1xuXHRcdFx0aWYgKGhhc0phbSkge1xuXHRcdFx0XHR0aGlzPy5tZW51Py5jdXJyZW50Py5hZGRJdGVtKFxuXHRcdFx0XHRcdDxNZW51SXRlbVxuXHRcdFx0XHRcdFx0dGV4dD17dGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIlRfQ09NTU9OX1NBUEZFX1NIQVJFX0pBTVwiKX1cblx0XHRcdFx0XHRcdGljb249e1wic2FwLWljb246Ly9zaGFyZS0yXCJ9XG5cdFx0XHRcdFx0XHRwcmVzcz17KCkgPT4gY29udHJvbGxlci5zaGFyZS5fdHJpZ2dlclNoYXJlVG9KYW0oKX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gcHJlcGFyZSB0ZWFtcyBtZW51IGl0ZW1zXG5cdFx0XHRmb3IgKGNvbnN0IGNvbGxhYm9yYXRpb25PcHRpb24gb2Ygc2hhcmVDb2xsYWJvcmF0aW9uT3B0aW9ucykge1xuXHRcdFx0XHRjb25zdCBtZW51SXRlbVNldHRpbmdzOiAkTWVudUl0ZW1TZXR0aW5ncyA9IHtcblx0XHRcdFx0XHR0ZXh0OiBjb2xsYWJvcmF0aW9uT3B0aW9uLnRleHQsXG5cdFx0XHRcdFx0aWNvbjogY29sbGFib3JhdGlvbk9wdGlvbi5pY29uLFxuXHRcdFx0XHRcdGl0ZW1zOiBbXVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmIChjb2xsYWJvcmF0aW9uT3B0aW9uPy5zdWJPcHRpb25zICYmIGNvbGxhYm9yYXRpb25PcHRpb24/LnN1Yk9wdGlvbnM/Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRtZW51SXRlbVNldHRpbmdzLml0ZW1zID0gW107XG5cdFx0XHRcdFx0Y29sbGFib3JhdGlvbk9wdGlvbi5zdWJPcHRpb25zLmZvckVhY2goKHN1Yk9wdGlvbjogQ29sbGFib3JhdGlvbk9wdGlvbnMpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHN1Yk1lbnVJdGVtID0gbmV3IE1lbnVJdGVtKHtcblx0XHRcdFx0XHRcdFx0dGV4dDogc3ViT3B0aW9uLnRleHQsXG5cdFx0XHRcdFx0XHRcdGljb246IHN1Yk9wdGlvbi5pY29uLFxuXHRcdFx0XHRcdFx0XHRwcmVzczogdGhpcy5jb2xsYWJvcmF0aW9uTWVudUl0ZW1QcmVzcyxcblx0XHRcdFx0XHRcdFx0Y3VzdG9tRGF0YTogbmV3IEN1c3RvbURhdGEoe1xuXHRcdFx0XHRcdFx0XHRcdGtleTogXCJjb2xsYWJvcmF0aW9uRGF0YVwiLFxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlOiBzdWJPcHRpb25cblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0aWYgKHN1Yk9wdGlvbi5mZXNyU3RlcE5hbWUpIHtcblx0XHRcdFx0XHRcdFx0RkVTUkhlbHBlci5zZXRTZW1hbnRpY1N0ZXBuYW1lKHN1Yk1lbnVJdGVtLCBcInByZXNzXCIsIHN1Yk9wdGlvbi5mZXNyU3RlcE5hbWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0KG1lbnVJdGVtU2V0dGluZ3MuaXRlbXMgYXMgTWVudUl0ZW1bXSkucHVzaChzdWJNZW51SXRlbSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaWYgdGhlcmUgYXJlIG5vIHN1YiBvcHRpb24gdGhlbiB0aGUgbWFpbiBvcHRpb24gc2hvdWxkIGJlIGNsaWNrYWJsZVxuXHRcdFx0XHRcdC8vIHNvIGFkZCBhIHByZXNzIGhhbmRsZXIuXG5cdFx0XHRcdFx0bWVudUl0ZW1TZXR0aW5ncy5wcmVzcyA9IHRoaXMuY29sbGFib3JhdGlvbk1lbnVJdGVtUHJlc3M7XG5cdFx0XHRcdFx0bWVudUl0ZW1TZXR0aW5nc1tcImN1c3RvbURhdGFcIl0gPSBuZXcgQ3VzdG9tRGF0YSh7XG5cdFx0XHRcdFx0XHRrZXk6IFwiY29sbGFib3JhdGlvbkRhdGFcIixcblx0XHRcdFx0XHRcdHZhbHVlOiBjb2xsYWJvcmF0aW9uT3B0aW9uXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgbWVudUl0ZW0gPSBuZXcgTWVudUl0ZW0obWVudUl0ZW1TZXR0aW5ncyk7XG5cdFx0XHRcdGlmIChtZW51SXRlbVNldHRpbmdzLnByZXNzICYmIGNvbGxhYm9yYXRpb25PcHRpb24uZmVzclN0ZXBOYW1lKSB7XG5cdFx0XHRcdFx0RkVTUkhlbHBlci5zZXRTZW1hbnRpY1N0ZXBuYW1lKG1lbnVJdGVtLCBcInByZXNzXCIsIGNvbGxhYm9yYXRpb25PcHRpb24uZmVzclN0ZXBOYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzPy5tZW51Py5jdXJyZW50Py5hZGRJdGVtKG1lbnVJdGVtKTtcblx0XHRcdH1cblx0XHRcdC8vIHNldCBzYXZlIGFzIHRpbGVcblx0XHRcdC8vIGZvciBub3cgd2UgbmVlZCB0byBjcmVhdGUgYWRkQm9va21hcmtCdXR0b24gdG8gdXNlIHRoZSBzYXZlIGFzIHRpbGUgZmVhdHVyZS5cblx0XHRcdC8vIEluIHRoZSBmdXR1cmUgc2F2ZSBhcyB0aWxlIHNob3VsZCBiZSBhdmFpbGFibGUgYXMgYW4gQVBJIG9yIGEgTWVudUl0ZW0gc28gdGhhdCBpdCBjYW4gYmUgYWRkZWQgdG8gdGhlIE1lbnUgYnV0dG9uLlxuXHRcdFx0Ly8gVGhpcyBuZWVkcyB0byBiZSBkaXNjdXNzZWQgd2l0aCBBZGRCb29rbWFya0J1dHRvbiB0ZWFtLlxuXHRcdFx0Y29uc3QgYWRkQm9va21hcmtCdXR0b24gPSBuZXcgQWRkQm9va21hcmtCdXR0b24oKTtcblx0XHRcdGlmIChhZGRCb29rbWFya0J1dHRvbi5nZXRFbmFibGVkKCkpIHtcblx0XHRcdFx0dGhpcz8ubWVudT8uY3VycmVudD8uYWRkSXRlbShcblx0XHRcdFx0XHQ8TWVudUl0ZW1cblx0XHRcdFx0XHRcdHJlZj17dGhpcy5zYXZlQXNUaWxlTWVudUl0ZW19XG5cdFx0XHRcdFx0XHR0ZXh0PXthZGRCb29rbWFya0J1dHRvbi5nZXRUZXh0KCl9XG5cdFx0XHRcdFx0XHRpY29uPXthZGRCb29rbWFya0J1dHRvbi5nZXRJY29uKCl9XG5cdFx0XHRcdFx0XHRwcmVzcz17KCkgPT4gY29udHJvbGxlci5zaGFyZS5fc2F2ZUFzVGlsZSh0aGlzLnNhdmVBc1RpbGVNZW51SXRlbS5jdXJyZW50KX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7eyBkZXBlbmRlbnRzOiBbYWRkQm9va21hcmtCdXR0b25dIH19XG5cdFx0XHRcdFx0PC9NZW51SXRlbT5cblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFkZEJvb2ttYXJrQnV0dG9uLmRlc3Ryb3koKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRhc3luYyBjb2xsYWJvcmF0aW9uTWVudUl0ZW1QcmVzcyhldmVudDogVUk1RXZlbnQpIHtcblx0XHRjb25zdCBjbGlja2VkTWVudUl0ZW0gPSBldmVudC5nZXRTb3VyY2UoKSBhcyBNZW51SXRlbTtcblx0XHRjb25zdCBjb2xsYWJvcmF0aW9uVGVhbXNIZWxwZXI6IFRlYW1zSGVscGVyU2VydmljZSA9IGF3YWl0IFNlcnZpY2VDb250YWluZXIuZ2V0U2VydmljZUFzeW5jKCk7XG5cdFx0Y29uc3QgdmlldzogVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcoY2xpY2tlZE1lbnVJdGVtKTtcblx0XHRjb25zdCBjb250cm9sbGVyOiBQYWdlQ29udHJvbGxlciA9IHZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyO1xuXHRcdC8vIGNhbGwgYWRhcHQgc2hhcmUgbWV0YWRhdGEgc28gdGhhdCB0aGUgY29sbGFib3JhdGlvbiBpbmZvIG1vZGVsIGlzIHVwZGF0ZWQgd2l0aCB0aGUgcmVxdWlyZWQgaW5mb1xuXHRcdGF3YWl0IGNvbnRyb2xsZXIuc2hhcmUuX2FkYXB0U2hhcmVNZXRhZGF0YSgpO1xuXHRcdGNvbnN0IGNvbGxhYm9yYXRpb25JbmZvID0gKHZpZXcuZ2V0TW9kZWwoXCJjb2xsYWJvcmF0aW9uSW5mb1wiKSBhcyBKU09OTW9kZWwpLmdldERhdGEoKTtcblx0XHRjb2xsYWJvcmF0aW9uVGVhbXNIZWxwZXIuc2hhcmUoY2xpY2tlZE1lbnVJdGVtLmRhdGEoXCJjb2xsYWJvcmF0aW9uRGF0YVwiKSwgY29sbGFib3JhdGlvbkluZm8pO1xuXHR9XG5cblx0Z2V0Q29udGVudCh2aWV3OiBWaWV3LCBhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCkge1xuXHRcdC8vIEN0cmwrU2hpZnQrUyBpcyBuZWVkZWQgZm9yIHRoZSB0aW1lIGJlaW5nIGJ1dCB0aGlzIG5lZWRzIHRvIGJlIHJlbW92ZWQgYWZ0ZXIgYmFja2xvZyBmcm9tIG1lbnUgYnV0dG9uXG5cdFx0Y29uc3QgbWVudUJ1dHRvbiA9IChcblx0XHRcdDxTaGFyZUFQSSBpZD17dGhpcy5pZH0+XG5cdFx0XHRcdDxNZW51QnV0dG9uXG5cdFx0XHRcdFx0cmVmPXt0aGlzLm1lbnVCdXR0b259XG5cdFx0XHRcdFx0aWNvbj17XCJzYXAtaWNvbjovL2FjdGlvblwifVxuXHRcdFx0XHRcdHZpc2libGU9e3RoaXMudmlzaWJsZSBhcyBhbnl9XG5cdFx0XHRcdFx0dG9vbHRpcD17XCJ7c2FwLmZlLmkxOG4+TV9DT01NT05fU0FQRkVfQUNUSU9OX1NIQVJFfSAoQ3RybCtTaGlmdCtTKVwifVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PE1lbnUgcmVmPXt0aGlzLm1lbnV9PjwvTWVudT5cblx0XHRcdFx0PC9NZW51QnV0dG9uPlxuXHRcdFx0PC9TaGFyZUFQST5cblx0XHQpO1xuXHRcdHZpZXcuYWRkRGVwZW5kZW50KFxuXHRcdFx0PENvbW1hbmRFeGVjdXRpb25cblx0XHRcdFx0dmlzaWJsZT17dGhpcy52aXNpYmxlfVxuXHRcdFx0XHRlbmFibGVkPXt0aGlzLnZpc2libGV9XG5cdFx0XHRcdGNvbW1hbmQ9XCJTaGFyZVwiXG5cdFx0XHRcdGV4ZWN1dGU9eygpID0+IHRoaXMubWVudUJ1dHRvbi5jdXJyZW50Py5nZXRNZW51KCkub3BlbkJ5KHRoaXMubWVudUJ1dHRvbi5jdXJyZW50LCB0cnVlKX1cblx0XHRcdC8+XG5cdFx0KTtcblx0XHQvLyBUaGUgaW5pdGlhbGl6YXRpb24gaXMgYXN5bmNocm9ub3VzLCBzbyB3ZSBqdXN0IHRyaWdnZXIgaXQgYW5kIGhvcGUgZm9yIHRoZSBiZXN0IDpEXG5cdFx0dGhpcy5pc0luaXRpYWxpemVkID0gdGhpcy5faW5pdGlhbGl6ZU1lbnVJdGVtcyh2aWV3LCBhcHBDb21wb25lbnQpLmNhdGNoKChlcnJvcikgPT4ge1xuXHRcdFx0TG9nLmVycm9yKGVycm9yIGFzIHN0cmluZyk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG1lbnVCdXR0b247XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztNQWtEcUJBLFVBQVU7RUF4Qi9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBbEJBLE9BbUJDQyxtQkFBbUIsQ0FBQztJQUNwQkMsSUFBSSxFQUFFLE9BQU87SUFDYkMsU0FBUyxFQUFFLHdCQUF3QjtJQUNuQ0MsZUFBZSxFQUFFO0VBQ2xCLENBQUMsQ0FBQyxVQUVBQyxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsUUFBUSxFQUFFLElBQUk7SUFDZEMsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBR0RILGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsU0FBUztJQUNmRSxRQUFRLEVBQUUsSUFBSTtJQUNkQyxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFHREMsZUFBZSxFQUFFLFVBR2pCQSxlQUFlLEVBQUUs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