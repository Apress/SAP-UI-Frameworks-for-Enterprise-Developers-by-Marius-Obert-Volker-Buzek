/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/strings/formatMessage", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/m/Button", "sap/m/library", "sap/m/ObjectMarker", "sap/m/Popover", "sap/m/Text", "sap/m/VBox", "sap/ui/core/Core", "sap/fe/core/jsx-runtime/jsx", "sap/fe/core/jsx-runtime/jsxs"], function (formatMessage, BuildingBlockSupport, RuntimeBuildingBlock, CommonUtils, BindingHelper, MetaModelConverter, BindingToolkit, Button, library, ObjectMarker, Popover, Text, VBox, Core, _jsx, _jsxs) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
  var _exports = {};
  var ObjectMarkerVisibility = library.ObjectMarkerVisibility;
  var ObjectMarkerType = library.ObjectMarkerType;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isEmpty = BindingToolkit.isEmpty;
  var ifElse = BindingToolkit.ifElse;
  var constant = BindingToolkit.constant;
  var and = BindingToolkit.and;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let DraftIndicatorBlock = (
  /**
   * Building block for creating a DraftIndicator based on the metadata provided by OData V4.
   *
   * Usage example:
   * <pre>
   * &lt;macro:DraftIndicator
   *   id="SomeID"
   * /&gt;
   * </pre>
   *
   * @private
   */
  _dec = defineBuildingBlock({
    name: "DraftIndicator",
    namespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "string",
    validate: value => {
      if (value && ![ObjectMarkerVisibility.IconOnly, ObjectMarkerVisibility.IconAndText].includes(value)) {
        throw new Error(`Allowed value ${value} does not match`);
      }
    }
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty"]
  }), _dec6 = blockAttribute({
    type: "boolean",
    bindable: true
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(DraftIndicatorBlock, _RuntimeBuildingBlock);
    function DraftIndicatorBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _RuntimeBuildingBlock.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "draftIndicatorType", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isDraftIndicatorVisible", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "class", _descriptor6, _assertThisInitialized(_this));
      return _this;
    }
    _exports = DraftIndicatorBlock;
    /**
     * Runtime formatter function to format the correct text that displays the owner of a draft.
     *
     * This is used in case the DraftIndicator is shown for an active entity that has a draft of another user.
     *
     * @param hasDraftEntity
     * @param draftInProcessByUser
     * @param draftLastChangedByUser
     * @param draftInProcessByUserDesc
     * @param draftLastChangedByUserDesc
     * @returns Text to display
     */
    DraftIndicatorBlock.formatDraftOwnerTextInPopover = function formatDraftOwnerTextInPopover(hasDraftEntity, draftInProcessByUser, draftLastChangedByUser, draftInProcessByUserDesc, draftLastChangedByUserDesc) {
      const macroResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      if (hasDraftEntity) {
        const userDescription = draftInProcessByUserDesc || draftInProcessByUser || draftLastChangedByUserDesc || draftLastChangedByUser;
        if (!userDescription) {
          return macroResourceBundle.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_UNKNOWN");
        } else {
          return draftInProcessByUser ? macroResourceBundle.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_LOCKED_BY_KNOWN", [userDescription]) : macroResourceBundle.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_KNOWN", [userDescription]);
        }
      } else {
        return macroResourceBundle.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_NO_DATA_TEXT");
      }
    }

    /***
     * Gets the properties of the DraftAdministrativeData entity connected to the given entity set
     *
     * @returns List of property names
     */;
    var _proto = DraftIndicatorBlock.prototype;
    _proto.getDraftAdministrativeDataProperties = function getDraftAdministrativeDataProperties() {
      const draftAdministrativeDataContext = this.entitySet.getModel().createBindingContext("DraftAdministrativeData", this.entitySet);
      const convertedDraftAdministrativeData = convertMetaModelContext(draftAdministrativeDataContext);
      return convertedDraftAdministrativeData.targetType.entityProperties.map(property => property.name);
    }

    /**
     * Constructs the binding expression for the text displayed as title of the popup.
     *
     * @returns The binding expression
     */;
    _proto.getPopoverTitleBindingExpression = function getPopoverTitleBindingExpression() {
      return ifElse(not(Entity.IsActive), pathInModel("M_COMMON_DRAFT_OBJECT", "sap.fe.i18n"), ifElse(Entity.HasDraft, ifElse(not(isEmpty(pathInModel("DraftAdministrativeData/InProcessByUser"))), pathInModel("M_COMMON_DRAFT_LOCKED_OBJECT", "sap.fe.i18n"), pathInModel("M_DRAFT_POPOVER_ADMIN_UNSAVED_OBJECT", "sap.fe.i18n")), this.draftIndicatorType === ObjectMarkerVisibility.IconAndText ? " " : pathInModel("C_DRAFT_POPOVER_ADMIN_DATA_DRAFTINFO_FLAGGED_OBJECT", "sap.fe.i18n")));
    }

    /**
     * Constructs the binding expression for the text displayed to identify the draft owner in the popup.
     * This binding is configured to call formatDraftOwnerTextInPopover at runtime.
     *
     * We cannot reference formatDraftOwnerTextInPopover directly as we need to conditionally pass properties that might exist or not,
     * and referring to non-existing properties fails the binding.
     *
     * @returns The binding expression
     */;
    _proto.getDraftOwnerTextBindingExpression = function getDraftOwnerTextBindingExpression() {
      const draftAdministrativeDataProperties = this.getDraftAdministrativeDataProperties();
      const parts = [{
        path: "HasDraftEntity",
        targetType: "any"
      }, {
        path: "DraftAdministrativeData/InProcessByUser"
      }, {
        path: "DraftAdministrativeData/LastChangedByUser"
      }];
      if (draftAdministrativeDataProperties.includes("InProcessByUserDescription")) {
        parts.push({
          path: "DraftAdministrativeData/InProcessByUserDescription"
        });
      }
      if (draftAdministrativeDataProperties.includes("LastChangedByUserDescription")) {
        parts.push({
          path: "DraftAdministrativeData/LastChangedByUserDescription"
        });
      }

      //parts.push({path: "sap.fe.i18n>"})

      return {
        parts,
        formatter: DraftIndicatorBlock.formatDraftOwnerTextInPopover
      };
    }

    /**
     * Creates a popover control to display draft information.
     *
     * @param control Control that the popover is to be created for
     * @returns The created popover control
     */;
    _proto.createPopover = function createPopover(control) {
      const isDraftWithNoChangesBinding = and(not(Entity.IsActive), isEmpty(pathInModel("DraftAdministrativeData/LastChangeDateTime")));
      const draftWithNoChangesTextBinding = this.draftIndicatorType === ObjectMarkerVisibility.IconAndText ? pathInModel("M_DRAFT_POPOVER_ADMIN_GENERIC_LOCKED_OBJECT_POPOVER_TEXT", "sap.fe.i18n") : pathInModel("C_DRAFT_POPOVER_ADMIN_DATA_DRAFTINFO_POPOVER_NO_DATA_TEXT", "sap.fe.i18n");
      const isDraftWithChangesBinding = and(not(Entity.IsActive), not(isEmpty(pathInModel("DraftAdministrativeData/LastChangeDateTime"))));
      const draftWithChangesTextBinding = {
        parts: [{
          path: "M_DRAFT_POPOVER_ADMIN_LAST_CHANGE_TEXT",
          model: "sap.fe.i18n"
        }, {
          path: "DraftAdministrativeData/LastChangeDateTime"
        }],
        formatter: formatMessage
      };
      const isActiveInstanceBinding = and(Entity.IsActive, not(isEmpty(pathInModel("DraftAdministrativeData/LastChangeDateTime"))));
      const activeInstanceTextBinding = {
        ...draftWithChangesTextBinding
      };
      const popover = _jsx(Popover, {
        title: this.getPopoverTitleBindingExpression(),
        showHeader: true,
        contentWidth: "15.625rem",
        verticalScrolling: false,
        class: "sapUiContentPadding",
        endButton: _jsx(Button, {
          icon: "sap-icon://decline",
          press: () => {
            var _this$draftPopover;
            return (_this$draftPopover = this.draftPopover) === null || _this$draftPopover === void 0 ? void 0 : _this$draftPopover.close();
          }
        }),
        children: _jsxs(VBox, {
          class: "sapUiContentPadding",
          children: [_jsx(VBox, {
            visible: isDraftWithNoChangesBinding,
            children: _jsx(Text, {
              text: draftWithNoChangesTextBinding
            })
          }), _jsx(VBox, {
            visible: isDraftWithChangesBinding,
            children: _jsx(Text, {
              text: draftWithChangesTextBinding
            })
          }), _jsxs(VBox, {
            visible: isActiveInstanceBinding,
            children: [_jsx(Text, {
              text: this.getDraftOwnerTextBindingExpression()
            }), _jsx(Text, {
              class: "sapUiSmallMarginTop",
              text: activeInstanceTextBinding
            })]
          })]
        })
      });
      CommonUtils.getTargetView(control).addDependent(popover);
      return popover;
    }

    /**
     * Handles pressing of the object marker by opening a corresponding popover.
     *
     * @param event Event object passed from the press event
     */;
    _proto.onObjectMarkerPressed = function onObjectMarkerPressed(event) {
      const source = event.getSource();
      const bindingContext = source.getBindingContext();
      this.draftPopover ??= this.createPopover(source);
      this.draftPopover.setBindingContext(bindingContext);
      this.draftPopover.openBy(source, false);
    }

    /**
     * Constructs the binding expression for the "additionalInfo" attribute in the "IconAndText" case.
     *
     * @returns The binding expression
     */;
    _proto.getIconAndTextAdditionalInfoBindingExpression = function getIconAndTextAdditionalInfoBindingExpression() {
      const draftAdministrativeDataProperties = this.getDraftAdministrativeDataProperties();
      const orBindings = [];
      if (draftAdministrativeDataProperties.includes("InProcessByUserDescription")) {
        orBindings.push(pathInModel("DraftAdministrativeData/InProcessByUserDescription"));
      }
      orBindings.push(pathInModel("DraftAdministrativeData/InProcessByUser"));
      if (draftAdministrativeDataProperties.includes("LastChangedByUserDescription")) {
        orBindings.push(pathInModel("DraftAdministrativeData/LastChangedByUserDescription"));
      }
      orBindings.push(pathInModel("DraftAdministrativeData/LastChangedByUser"));
      return ifElse(Entity.HasDraft, or(...orBindings), "");
    }

    /**
     * Returns the content of this building block for the "IconAndText" type.
     *
     * @returns The control tree
     */;
    _proto.getIconAndTextContent = function getIconAndTextContent() {
      const type = ifElse(not(Entity.IsActive), ObjectMarkerType.Draft, ifElse(Entity.HasDraft, ifElse(pathInModel("DraftAdministrativeData/InProcessByUser"), ObjectMarkerType.LockedBy, ifElse(pathInModel("DraftAdministrativeData/LastChangedByUser"), ObjectMarkerType.UnsavedBy, ObjectMarkerType.Unsaved)), ObjectMarkerType.Flagged));
      const visibility = ifElse(not(Entity.HasDraft), ObjectMarkerVisibility.TextOnly, ObjectMarkerVisibility.IconAndText);
      return _jsx(ObjectMarker, {
        type: type,
        press: this.onObjectMarkerPressed.bind(this),
        visibility: visibility,
        visible: this.isDraftIndicatorVisible,
        additionalInfo: this.getIconAndTextAdditionalInfoBindingExpression(),
        ariaLabelledBy: this.ariaLabelledBy ? [this.ariaLabelledBy] : [],
        class: this.class
      });
    }

    /**
     * Returns the content of this building block for the "IconOnly" type.
     *
     * @returns The control tree
     */;
    _proto.getIconOnlyContent = function getIconOnlyContent() {
      const type = ifElse(not(Entity.IsActive), ObjectMarkerType.Draft, ifElse(Entity.HasDraft, ifElse(pathInModel("DraftAdministrativeData/InProcessByUser"), ObjectMarkerType.Locked, ObjectMarkerType.Unsaved), ObjectMarkerType.Flagged));
      const visible = and(not(UI.IsEditable), Entity.HasDraft, not(pathInModel("DraftAdministrativeData/DraftIsCreatedByMe")));
      return _jsx(ObjectMarker, {
        type: type,
        press: this.onObjectMarkerPressed.bind(this),
        visibility: ObjectMarkerVisibility.IconOnly,
        visible: visible,
        ariaLabelledBy: this.ariaLabelledBy ? [this.ariaLabelledBy] : [],
        class: this.class
      });
    }

    /**
     * Returns the content of this building block.
     *
     * @returns The control tree
     */;
    _proto.getContent = function getContent() {
      if (this.draftIndicatorType === ObjectMarkerVisibility.IconAndText) {
        return this.getIconAndTextContent();
      } else {
        return this.getIconOnlyContent();
      }
    };
    return DraftIndicatorBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "draftIndicatorType", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return ObjectMarkerVisibility.IconAndText;
    }
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "isDraftIndicatorVisible", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return constant(false);
    }
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "class", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  })), _class2)) || _class);
  _exports = DraftIndicatorBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmFmdEluZGljYXRvckJsb2NrIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJ2YWxpZGF0ZSIsInZhbHVlIiwiT2JqZWN0TWFya2VyVmlzaWJpbGl0eSIsIkljb25Pbmx5IiwiSWNvbkFuZFRleHQiLCJpbmNsdWRlcyIsIkVycm9yIiwicmVxdWlyZWQiLCJleHBlY3RlZFR5cGVzIiwiYmluZGFibGUiLCJmb3JtYXREcmFmdE93bmVyVGV4dEluUG9wb3ZlciIsImhhc0RyYWZ0RW50aXR5IiwiZHJhZnRJblByb2Nlc3NCeVVzZXIiLCJkcmFmdExhc3RDaGFuZ2VkQnlVc2VyIiwiZHJhZnRJblByb2Nlc3NCeVVzZXJEZXNjIiwiZHJhZnRMYXN0Q2hhbmdlZEJ5VXNlckRlc2MiLCJtYWNyb1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsInVzZXJEZXNjcmlwdGlvbiIsImdldFRleHQiLCJnZXREcmFmdEFkbWluaXN0cmF0aXZlRGF0YVByb3BlcnRpZXMiLCJkcmFmdEFkbWluaXN0cmF0aXZlRGF0YUNvbnRleHQiLCJlbnRpdHlTZXQiLCJnZXRNb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiY29udmVydGVkRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEiLCJjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCIsInRhcmdldFR5cGUiLCJlbnRpdHlQcm9wZXJ0aWVzIiwibWFwIiwicHJvcGVydHkiLCJnZXRQb3BvdmVyVGl0bGVCaW5kaW5nRXhwcmVzc2lvbiIsImlmRWxzZSIsIm5vdCIsIkVudGl0eSIsIklzQWN0aXZlIiwicGF0aEluTW9kZWwiLCJIYXNEcmFmdCIsImlzRW1wdHkiLCJkcmFmdEluZGljYXRvclR5cGUiLCJnZXREcmFmdE93bmVyVGV4dEJpbmRpbmdFeHByZXNzaW9uIiwiZHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFQcm9wZXJ0aWVzIiwicGFydHMiLCJwYXRoIiwicHVzaCIsImZvcm1hdHRlciIsImNyZWF0ZVBvcG92ZXIiLCJjb250cm9sIiwiaXNEcmFmdFdpdGhOb0NoYW5nZXNCaW5kaW5nIiwiYW5kIiwiZHJhZnRXaXRoTm9DaGFuZ2VzVGV4dEJpbmRpbmciLCJpc0RyYWZ0V2l0aENoYW5nZXNCaW5kaW5nIiwiZHJhZnRXaXRoQ2hhbmdlc1RleHRCaW5kaW5nIiwibW9kZWwiLCJmb3JtYXRNZXNzYWdlIiwiaXNBY3RpdmVJbnN0YW5jZUJpbmRpbmciLCJhY3RpdmVJbnN0YW5jZVRleHRCaW5kaW5nIiwicG9wb3ZlciIsImRyYWZ0UG9wb3ZlciIsImNsb3NlIiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwiYWRkRGVwZW5kZW50Iiwib25PYmplY3RNYXJrZXJQcmVzc2VkIiwiZXZlbnQiLCJzb3VyY2UiLCJnZXRTb3VyY2UiLCJiaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwic2V0QmluZGluZ0NvbnRleHQiLCJvcGVuQnkiLCJnZXRJY29uQW5kVGV4dEFkZGl0aW9uYWxJbmZvQmluZGluZ0V4cHJlc3Npb24iLCJvckJpbmRpbmdzIiwib3IiLCJnZXRJY29uQW5kVGV4dENvbnRlbnQiLCJPYmplY3RNYXJrZXJUeXBlIiwiRHJhZnQiLCJMb2NrZWRCeSIsIlVuc2F2ZWRCeSIsIlVuc2F2ZWQiLCJGbGFnZ2VkIiwidmlzaWJpbGl0eSIsIlRleHRPbmx5IiwiYmluZCIsImlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlIiwiYXJpYUxhYmVsbGVkQnkiLCJjbGFzcyIsImdldEljb25Pbmx5Q29udGVudCIsIkxvY2tlZCIsInZpc2libGUiLCJVSSIsIklzRWRpdGFibGUiLCJnZXRDb250ZW50IiwiUnVudGltZUJ1aWxkaW5nQmxvY2siLCJjb25zdGFudCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRHJhZnRJbmRpY2F0b3IuYmxvY2sudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTmF2aWdhdGlvblByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgZm9ybWF0TWVzc2FnZSBmcm9tIFwic2FwL2Jhc2Uvc3RyaW5ncy9mb3JtYXRNZXNzYWdlXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9SdW50aW1lQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgRW50aXR5LCBVSSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0IHsgY29udmVydE1ldGFNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGFuZCwgY29uc3RhbnQsIGlmRWxzZSwgaXNFbXB0eSwgbm90LCBvciwgcGF0aEluTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgeyBPYmplY3RNYXJrZXJUeXBlLCBPYmplY3RNYXJrZXJWaXNpYmlsaXR5IH0gZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCBPYmplY3RNYXJrZXIgZnJvbSBcInNhcC9tL09iamVjdE1hcmtlclwiO1xuaW1wb3J0IFBvcG92ZXIgZnJvbSBcInNhcC9tL1BvcG92ZXJcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgVkJveCBmcm9tIFwic2FwL20vVkJveFwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBEcmFmdEluZGljYXRvciBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86RHJhZnRJbmRpY2F0b3JcbiAqICAgaWQ9XCJTb21lSURcIlxuICogLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHsgbmFtZTogXCJEcmFmdEluZGljYXRvclwiLCBuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiIH0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcmFmdEluZGljYXRvckJsb2NrIGV4dGVuZHMgUnVudGltZUJ1aWxkaW5nQmxvY2sge1xuXHQvKipcblx0ICogSUQgb2YgdGhlIERyYWZ0SW5kaWNhdG9yXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHB1YmxpYyBpZD86IHN0cmluZztcblxuXHQvKipcblx0ICogUHJvcGVydHkgYWRkZWQgdG8gYXNzb2NpYXRlIHRoZSBsYWJlbCB3aXRoIHRoZSBEcmFmdEluZGljYXRvclxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRwdWJsaWMgYXJpYUxhYmVsbGVkQnk/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFR5cGUgb2YgdGhlIERyYWZ0SW5kaWNhdG9yLCBlaXRoZXIgXCJJY29uQW5kVGV4dFwiIChkZWZhdWx0KSBvciBcIkljb25Pbmx5XCJcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHR2YWxpZGF0ZTogKHZhbHVlPzogT2JqZWN0TWFya2VyVmlzaWJpbGl0eSkgPT4ge1xuXHRcdFx0aWYgKHZhbHVlICYmICFbT2JqZWN0TWFya2VyVmlzaWJpbGl0eS5JY29uT25seSwgT2JqZWN0TWFya2VyVmlzaWJpbGl0eS5JY29uQW5kVGV4dF0uaW5jbHVkZXModmFsdWUpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke3ZhbHVlfSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblx0cHVibGljIGRyYWZ0SW5kaWNhdG9yVHlwZTogT2JqZWN0TWFya2VyVmlzaWJpbGl0eS5JY29uT25seSB8IE9iamVjdE1hcmtlclZpc2liaWxpdHkuSWNvbkFuZFRleHQgPSBPYmplY3RNYXJrZXJWaXNpYmlsaXR5Lkljb25BbmRUZXh0O1xuXG5cdC8qKlxuXHQgKiBNYW5kYXRvcnkgY29udGV4dCB0byB0aGUgRW50aXR5U2V0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsIHJlcXVpcmVkOiB0cnVlLCBleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIl0gfSlcblx0cHVibGljIGVudGl0eVNldCE6IENvbnRleHQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIsIGJpbmRhYmxlOiB0cnVlIH0pXG5cdHB1YmxpYyBpc0RyYWZ0SW5kaWNhdG9yVmlzaWJsZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+ID0gY29uc3RhbnQoZmFsc2UpO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0cHVibGljIGNsYXNzID0gXCJcIjtcblxuXHRkcmFmdFBvcG92ZXI/OiBQb3BvdmVyO1xuXG5cdC8qKlxuXHQgKiBSdW50aW1lIGZvcm1hdHRlciBmdW5jdGlvbiB0byBmb3JtYXQgdGhlIGNvcnJlY3QgdGV4dCB0aGF0IGRpc3BsYXlzIHRoZSBvd25lciBvZiBhIGRyYWZ0LlxuXHQgKlxuXHQgKiBUaGlzIGlzIHVzZWQgaW4gY2FzZSB0aGUgRHJhZnRJbmRpY2F0b3IgaXMgc2hvd24gZm9yIGFuIGFjdGl2ZSBlbnRpdHkgdGhhdCBoYXMgYSBkcmFmdCBvZiBhbm90aGVyIHVzZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBoYXNEcmFmdEVudGl0eVxuXHQgKiBAcGFyYW0gZHJhZnRJblByb2Nlc3NCeVVzZXJcblx0ICogQHBhcmFtIGRyYWZ0TGFzdENoYW5nZWRCeVVzZXJcblx0ICogQHBhcmFtIGRyYWZ0SW5Qcm9jZXNzQnlVc2VyRGVzY1xuXHQgKiBAcGFyYW0gZHJhZnRMYXN0Q2hhbmdlZEJ5VXNlckRlc2Ncblx0ICogQHJldHVybnMgVGV4dCB0byBkaXNwbGF5XG5cdCAqL1xuXHRzdGF0aWMgZm9ybWF0RHJhZnRPd25lclRleHRJblBvcG92ZXIoXG5cdFx0dGhpczogdm9pZCxcblx0XHRoYXNEcmFmdEVudGl0eTogYm9vbGVhbixcblx0XHRkcmFmdEluUHJvY2Vzc0J5VXNlcjogc3RyaW5nLFxuXHRcdGRyYWZ0TGFzdENoYW5nZWRCeVVzZXI6IHN0cmluZyxcblx0XHRkcmFmdEluUHJvY2Vzc0J5VXNlckRlc2M6IHN0cmluZyxcblx0XHRkcmFmdExhc3RDaGFuZ2VkQnlVc2VyRGVzYzogc3RyaW5nXG5cdCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgbWFjcm9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLm1hY3Jvc1wiKTtcblx0XHRpZiAoaGFzRHJhZnRFbnRpdHkpIHtcblx0XHRcdGNvbnN0IHVzZXJEZXNjcmlwdGlvbiA9XG5cdFx0XHRcdGRyYWZ0SW5Qcm9jZXNzQnlVc2VyRGVzYyB8fCBkcmFmdEluUHJvY2Vzc0J5VXNlciB8fCBkcmFmdExhc3RDaGFuZ2VkQnlVc2VyRGVzYyB8fCBkcmFmdExhc3RDaGFuZ2VkQnlVc2VyO1xuXG5cdFx0XHRpZiAoIXVzZXJEZXNjcmlwdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gbWFjcm9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9GSUVMRF9SVU5USU1FX0RSQUZUX1BPUE9WRVJfVU5TQVZFRF9DSEFOR0VTX0JZX1VOS05PV05cIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gZHJhZnRJblByb2Nlc3NCeVVzZXJcblx0XHRcdFx0XHQ/IG1hY3JvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fRklFTERfUlVOVElNRV9EUkFGVF9QT1BPVkVSX0xPQ0tFRF9CWV9LTk9XTlwiLCBbdXNlckRlc2NyaXB0aW9uXSlcblx0XHRcdFx0XHQ6IG1hY3JvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fRklFTERfUlVOVElNRV9EUkFGVF9QT1BPVkVSX1VOU0FWRURfQ0hBTkdFU19CWV9LTk9XTlwiLCBbdXNlckRlc2NyaXB0aW9uXSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBtYWNyb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX0ZJRUxEX1JVTlRJTUVfRFJBRlRfUE9QT1ZFUl9OT19EQVRBX1RFWFRcIik7XG5cdFx0fVxuXHR9XG5cblx0LyoqKlxuXHQgKiBHZXRzIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBEcmFmdEFkbWluaXN0cmF0aXZlRGF0YSBlbnRpdHkgY29ubmVjdGVkIHRvIHRoZSBnaXZlbiBlbnRpdHkgc2V0XG5cdCAqXG5cdCAqIEByZXR1cm5zIExpc3Qgb2YgcHJvcGVydHkgbmFtZXNcblx0ICovXG5cdGdldERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhUHJvcGVydGllcygpOiBzdHJpbmdbXSB7XG5cdFx0Y29uc3QgZHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFDb250ZXh0ID0gdGhpcy5lbnRpdHlTZXQuZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhXCIsIHRoaXMuZW50aXR5U2V0KTtcblx0XHRjb25zdCBjb252ZXJ0ZWREcmFmdEFkbWluaXN0cmF0aXZlRGF0YSA9IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KGRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhQ29udGV4dCkgYXMgTmF2aWdhdGlvblByb3BlcnR5O1xuXHRcdHJldHVybiBjb252ZXJ0ZWREcmFmdEFkbWluaXN0cmF0aXZlRGF0YS50YXJnZXRUeXBlLmVudGl0eVByb3BlcnRpZXMubWFwKChwcm9wZXJ0eTogeyBuYW1lOiBzdHJpbmcgfSkgPT4gcHJvcGVydHkubmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgdGV4dCBkaXNwbGF5ZWQgYXMgdGl0bGUgb2YgdGhlIHBvcHVwLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uXG5cdCAqL1xuXHRnZXRQb3BvdmVyVGl0bGVCaW5kaW5nRXhwcmVzc2lvbigpIHtcblx0XHRyZXR1cm4gaWZFbHNlKFxuXHRcdFx0bm90KEVudGl0eS5Jc0FjdGl2ZSksXG5cdFx0XHRwYXRoSW5Nb2RlbChcIk1fQ09NTU9OX0RSQUZUX09CSkVDVFwiLCBcInNhcC5mZS5pMThuXCIpLFxuXHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRFbnRpdHkuSGFzRHJhZnQsXG5cdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHRub3QoaXNFbXB0eShwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0luUHJvY2Vzc0J5VXNlclwiKSkpLFxuXHRcdFx0XHRcdHBhdGhJbk1vZGVsKFwiTV9DT01NT05fRFJBRlRfTE9DS0VEX09CSkVDVFwiLCBcInNhcC5mZS5pMThuXCIpLFxuXHRcdFx0XHRcdHBhdGhJbk1vZGVsKFwiTV9EUkFGVF9QT1BPVkVSX0FETUlOX1VOU0FWRURfT0JKRUNUXCIsIFwic2FwLmZlLmkxOG5cIilcblx0XHRcdFx0KSxcblx0XHRcdFx0dGhpcy5kcmFmdEluZGljYXRvclR5cGUgPT09IE9iamVjdE1hcmtlclZpc2liaWxpdHkuSWNvbkFuZFRleHRcblx0XHRcdFx0XHQ/IFwiIFwiXG5cdFx0XHRcdFx0OiBwYXRoSW5Nb2RlbChcIkNfRFJBRlRfUE9QT1ZFUl9BRE1JTl9EQVRBX0RSQUZUSU5GT19GTEFHR0VEX09CSkVDVFwiLCBcInNhcC5mZS5pMThuXCIpXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSB0ZXh0IGRpc3BsYXllZCB0byBpZGVudGlmeSB0aGUgZHJhZnQgb3duZXIgaW4gdGhlIHBvcHVwLlxuXHQgKiBUaGlzIGJpbmRpbmcgaXMgY29uZmlndXJlZCB0byBjYWxsIGZvcm1hdERyYWZ0T3duZXJUZXh0SW5Qb3BvdmVyIGF0IHJ1bnRpbWUuXG5cdCAqXG5cdCAqIFdlIGNhbm5vdCByZWZlcmVuY2UgZm9ybWF0RHJhZnRPd25lclRleHRJblBvcG92ZXIgZGlyZWN0bHkgYXMgd2UgbmVlZCB0byBjb25kaXRpb25hbGx5IHBhc3MgcHJvcGVydGllcyB0aGF0IG1pZ2h0IGV4aXN0IG9yIG5vdCxcblx0ICogYW5kIHJlZmVycmluZyB0byBub24tZXhpc3RpbmcgcHJvcGVydGllcyBmYWlscyB0aGUgYmluZGluZy5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvblxuXHQgKi9cblx0Z2V0RHJhZnRPd25lclRleHRCaW5kaW5nRXhwcmVzc2lvbigpIHtcblx0XHRjb25zdCBkcmFmdEFkbWluaXN0cmF0aXZlRGF0YVByb3BlcnRpZXMgPSB0aGlzLmdldERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhUHJvcGVydGllcygpO1xuXG5cdFx0Y29uc3QgcGFydHMgPSBbXG5cdFx0XHR7IHBhdGg6IFwiSGFzRHJhZnRFbnRpdHlcIiwgdGFyZ2V0VHlwZTogXCJhbnlcIiB9LFxuXHRcdFx0eyBwYXRoOiBcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0luUHJvY2Vzc0J5VXNlclwiIH0sXG5cdFx0XHR7IHBhdGg6IFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvTGFzdENoYW5nZWRCeVVzZXJcIiB9XG5cdFx0XTtcblx0XHRpZiAoZHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFQcm9wZXJ0aWVzLmluY2x1ZGVzKFwiSW5Qcm9jZXNzQnlVc2VyRGVzY3JpcHRpb25cIikpIHtcblx0XHRcdHBhcnRzLnB1c2goeyBwYXRoOiBcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0luUHJvY2Vzc0J5VXNlckRlc2NyaXB0aW9uXCIgfSk7XG5cdFx0fVxuXHRcdGlmIChkcmFmdEFkbWluaXN0cmF0aXZlRGF0YVByb3BlcnRpZXMuaW5jbHVkZXMoXCJMYXN0Q2hhbmdlZEJ5VXNlckRlc2NyaXB0aW9uXCIpKSB7XG5cdFx0XHRwYXJ0cy5wdXNoKHsgcGF0aDogXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9MYXN0Q2hhbmdlZEJ5VXNlckRlc2NyaXB0aW9uXCIgfSk7XG5cdFx0fVxuXG5cdFx0Ly9wYXJ0cy5wdXNoKHtwYXRoOiBcInNhcC5mZS5pMThuPlwifSlcblxuXHRcdHJldHVybiB7IHBhcnRzLCBmb3JtYXR0ZXI6IERyYWZ0SW5kaWNhdG9yQmxvY2suZm9ybWF0RHJhZnRPd25lclRleHRJblBvcG92ZXIgfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgcG9wb3ZlciBjb250cm9sIHRvIGRpc3BsYXkgZHJhZnQgaW5mb3JtYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250cm9sIENvbnRyb2wgdGhhdCB0aGUgcG9wb3ZlciBpcyB0byBiZSBjcmVhdGVkIGZvclxuXHQgKiBAcmV0dXJucyBUaGUgY3JlYXRlZCBwb3BvdmVyIGNvbnRyb2xcblx0ICovXG5cdGNyZWF0ZVBvcG92ZXIoY29udHJvbDogQ29udHJvbCk6IFBvcG92ZXIge1xuXHRcdGNvbnN0IGlzRHJhZnRXaXRoTm9DaGFuZ2VzQmluZGluZyA9IGFuZChub3QoRW50aXR5LklzQWN0aXZlKSwgaXNFbXB0eShwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0xhc3RDaGFuZ2VEYXRlVGltZVwiKSkpO1xuXHRcdGNvbnN0IGRyYWZ0V2l0aE5vQ2hhbmdlc1RleHRCaW5kaW5nID1cblx0XHRcdHRoaXMuZHJhZnRJbmRpY2F0b3JUeXBlID09PSBPYmplY3RNYXJrZXJWaXNpYmlsaXR5Lkljb25BbmRUZXh0XG5cdFx0XHRcdD8gcGF0aEluTW9kZWwoXCJNX0RSQUZUX1BPUE9WRVJfQURNSU5fR0VORVJJQ19MT0NLRURfT0JKRUNUX1BPUE9WRVJfVEVYVFwiLCBcInNhcC5mZS5pMThuXCIpXG5cdFx0XHRcdDogcGF0aEluTW9kZWwoXCJDX0RSQUZUX1BPUE9WRVJfQURNSU5fREFUQV9EUkFGVElORk9fUE9QT1ZFUl9OT19EQVRBX1RFWFRcIiwgXCJzYXAuZmUuaTE4blwiKTtcblxuXHRcdGNvbnN0IGlzRHJhZnRXaXRoQ2hhbmdlc0JpbmRpbmcgPSBhbmQoXG5cdFx0XHRub3QoRW50aXR5LklzQWN0aXZlKSxcblx0XHRcdG5vdChpc0VtcHR5KHBhdGhJbk1vZGVsKFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvTGFzdENoYW5nZURhdGVUaW1lXCIpKSlcblx0XHQpO1xuXHRcdGNvbnN0IGRyYWZ0V2l0aENoYW5nZXNUZXh0QmluZGluZyA9IHtcblx0XHRcdHBhcnRzOiBbXG5cdFx0XHRcdHsgcGF0aDogXCJNX0RSQUZUX1BPUE9WRVJfQURNSU5fTEFTVF9DSEFOR0VfVEVYVFwiLCBtb2RlbDogXCJzYXAuZmUuaTE4blwiIH0sXG5cdFx0XHRcdHsgcGF0aDogXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9MYXN0Q2hhbmdlRGF0ZVRpbWVcIiB9XG5cdFx0XHRdLFxuXHRcdFx0Zm9ybWF0dGVyOiBmb3JtYXRNZXNzYWdlXG5cdFx0fTtcblxuXHRcdGNvbnN0IGlzQWN0aXZlSW5zdGFuY2VCaW5kaW5nID0gYW5kKEVudGl0eS5Jc0FjdGl2ZSwgbm90KGlzRW1wdHkocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9MYXN0Q2hhbmdlRGF0ZVRpbWVcIikpKSk7XG5cdFx0Y29uc3QgYWN0aXZlSW5zdGFuY2VUZXh0QmluZGluZyA9IHsgLi4uZHJhZnRXaXRoQ2hhbmdlc1RleHRCaW5kaW5nIH07XG5cblx0XHRjb25zdCBwb3BvdmVyOiBQb3BvdmVyID0gKFxuXHRcdFx0PFBvcG92ZXJcblx0XHRcdFx0dGl0bGU9e3RoaXMuZ2V0UG9wb3ZlclRpdGxlQmluZGluZ0V4cHJlc3Npb24oKX1cblx0XHRcdFx0c2hvd0hlYWRlcj17dHJ1ZX1cblx0XHRcdFx0Y29udGVudFdpZHRoPXtcIjE1LjYyNXJlbVwifVxuXHRcdFx0XHR2ZXJ0aWNhbFNjcm9sbGluZz17ZmFsc2V9XG5cdFx0XHRcdGNsYXNzPXtcInNhcFVpQ29udGVudFBhZGRpbmdcIn1cblx0XHRcdFx0ZW5kQnV0dG9uPXsoPEJ1dHRvbiBpY29uPXtcInNhcC1pY29uOi8vZGVjbGluZVwifSBwcmVzcz17KCkgPT4gdGhpcy5kcmFmdFBvcG92ZXI/LmNsb3NlKCl9IC8+KSBhcyBCdXR0b259XG5cdFx0XHQ+XG5cdFx0XHRcdDxWQm94IGNsYXNzPXtcInNhcFVpQ29udGVudFBhZGRpbmdcIn0+XG5cdFx0XHRcdFx0PFZCb3ggdmlzaWJsZT17aXNEcmFmdFdpdGhOb0NoYW5nZXNCaW5kaW5nfT5cblx0XHRcdFx0XHRcdDxUZXh0IHRleHQ9e2RyYWZ0V2l0aE5vQ2hhbmdlc1RleHRCaW5kaW5nfSAvPlxuXHRcdFx0XHRcdDwvVkJveD5cblx0XHRcdFx0XHQ8VkJveCB2aXNpYmxlPXtpc0RyYWZ0V2l0aENoYW5nZXNCaW5kaW5nfT5cblx0XHRcdFx0XHRcdDxUZXh0IHRleHQ9e2RyYWZ0V2l0aENoYW5nZXNUZXh0QmluZGluZ30gLz5cblx0XHRcdFx0XHQ8L1ZCb3g+XG5cdFx0XHRcdFx0PFZCb3ggdmlzaWJsZT17aXNBY3RpdmVJbnN0YW5jZUJpbmRpbmd9PlxuXHRcdFx0XHRcdFx0PFRleHQgdGV4dD17dGhpcy5nZXREcmFmdE93bmVyVGV4dEJpbmRpbmdFeHByZXNzaW9uKCl9IC8+XG5cdFx0XHRcdFx0XHQ8VGV4dCBjbGFzcz17XCJzYXBVaVNtYWxsTWFyZ2luVG9wXCJ9IHRleHQ9e2FjdGl2ZUluc3RhbmNlVGV4dEJpbmRpbmd9IC8+XG5cdFx0XHRcdFx0PC9WQm94PlxuXHRcdFx0XHQ8L1ZCb3g+XG5cdFx0XHQ8L1BvcG92ZXI+XG5cdFx0KSBhcyBQb3BvdmVyO1xuXG5cdFx0Q29tbW9uVXRpbHMuZ2V0VGFyZ2V0Vmlldyhjb250cm9sKS5hZGREZXBlbmRlbnQocG9wb3Zlcik7XG5cdFx0cmV0dXJuIHBvcG92ZXI7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBwcmVzc2luZyBvZiB0aGUgb2JqZWN0IG1hcmtlciBieSBvcGVuaW5nIGEgY29ycmVzcG9uZGluZyBwb3BvdmVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXZlbnQgRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIHRoZSBwcmVzcyBldmVudFxuXHQgKi9cblx0b25PYmplY3RNYXJrZXJQcmVzc2VkKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuXHRcdGNvbnN0IHNvdXJjZSA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2w7XG5cdFx0Y29uc3QgYmluZGluZ0NvbnRleHQgPSBzb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXG5cdFx0dGhpcy5kcmFmdFBvcG92ZXIgPz89IHRoaXMuY3JlYXRlUG9wb3Zlcihzb3VyY2UpO1xuXG5cdFx0dGhpcy5kcmFmdFBvcG92ZXIuc2V0QmluZGluZ0NvbnRleHQoYmluZGluZ0NvbnRleHQpO1xuXHRcdHRoaXMuZHJhZnRQb3BvdmVyLm9wZW5CeShzb3VyY2UsIGZhbHNlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBcImFkZGl0aW9uYWxJbmZvXCIgYXR0cmlidXRlIGluIHRoZSBcIkljb25BbmRUZXh0XCIgY2FzZS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvblxuXHQgKi9cblx0Z2V0SWNvbkFuZFRleHRBZGRpdGlvbmFsSW5mb0JpbmRpbmdFeHByZXNzaW9uKCkge1xuXHRcdGNvbnN0IGRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhUHJvcGVydGllcyA9IHRoaXMuZ2V0RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFQcm9wZXJ0aWVzKCk7XG5cblx0XHRjb25zdCBvckJpbmRpbmdzID0gW107XG5cdFx0aWYgKGRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhUHJvcGVydGllcy5pbmNsdWRlcyhcIkluUHJvY2Vzc0J5VXNlckRlc2NyaXB0aW9uXCIpKSB7XG5cdFx0XHRvckJpbmRpbmdzLnB1c2gocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9JblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvblwiKSk7XG5cdFx0fVxuXHRcdG9yQmluZGluZ3MucHVzaChwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0luUHJvY2Vzc0J5VXNlclwiKSk7XG5cdFx0aWYgKGRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhUHJvcGVydGllcy5pbmNsdWRlcyhcIkxhc3RDaGFuZ2VkQnlVc2VyRGVzY3JpcHRpb25cIikpIHtcblx0XHRcdG9yQmluZGluZ3MucHVzaChwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0xhc3RDaGFuZ2VkQnlVc2VyRGVzY3JpcHRpb25cIikpO1xuXHRcdH1cblx0XHRvckJpbmRpbmdzLnB1c2gocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9MYXN0Q2hhbmdlZEJ5VXNlclwiKSk7XG5cblx0XHRyZXR1cm4gaWZFbHNlPHN0cmluZz4oRW50aXR5Lkhhc0RyYWZ0LCBvciguLi5vckJpbmRpbmdzKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiwgXCJcIik7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY29udGVudCBvZiB0aGlzIGJ1aWxkaW5nIGJsb2NrIGZvciB0aGUgXCJJY29uQW5kVGV4dFwiIHR5cGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjb250cm9sIHRyZWVcblx0ICovXG5cdGdldEljb25BbmRUZXh0Q29udGVudCgpIHtcblx0XHRjb25zdCB0eXBlID0gaWZFbHNlKFxuXHRcdFx0bm90KEVudGl0eS5Jc0FjdGl2ZSksXG5cdFx0XHRPYmplY3RNYXJrZXJUeXBlLkRyYWZ0LFxuXHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRFbnRpdHkuSGFzRHJhZnQsXG5cdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHRwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0luUHJvY2Vzc0J5VXNlclwiKSxcblx0XHRcdFx0XHRPYmplY3RNYXJrZXJUeXBlLkxvY2tlZEJ5LFxuXHRcdFx0XHRcdGlmRWxzZShwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0xhc3RDaGFuZ2VkQnlVc2VyXCIpLCBPYmplY3RNYXJrZXJUeXBlLlVuc2F2ZWRCeSwgT2JqZWN0TWFya2VyVHlwZS5VbnNhdmVkKVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRPYmplY3RNYXJrZXJUeXBlLkZsYWdnZWRcblx0XHRcdClcblx0XHQpO1xuXG5cdFx0Y29uc3QgdmlzaWJpbGl0eSA9IGlmRWxzZShub3QoRW50aXR5Lkhhc0RyYWZ0KSwgT2JqZWN0TWFya2VyVmlzaWJpbGl0eS5UZXh0T25seSwgT2JqZWN0TWFya2VyVmlzaWJpbGl0eS5JY29uQW5kVGV4dCk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PE9iamVjdE1hcmtlclxuXHRcdFx0XHR0eXBlPXt0eXBlfVxuXHRcdFx0XHRwcmVzcz17dGhpcy5vbk9iamVjdE1hcmtlclByZXNzZWQuYmluZCh0aGlzKX1cblx0XHRcdFx0dmlzaWJpbGl0eT17dmlzaWJpbGl0eX1cblx0XHRcdFx0dmlzaWJsZT17dGhpcy5pc0RyYWZ0SW5kaWNhdG9yVmlzaWJsZX1cblx0XHRcdFx0YWRkaXRpb25hbEluZm89e3RoaXMuZ2V0SWNvbkFuZFRleHRBZGRpdGlvbmFsSW5mb0JpbmRpbmdFeHByZXNzaW9uKCl9XG5cdFx0XHRcdGFyaWFMYWJlbGxlZEJ5PXt0aGlzLmFyaWFMYWJlbGxlZEJ5ID8gW3RoaXMuYXJpYUxhYmVsbGVkQnldIDogW119XG5cdFx0XHRcdGNsYXNzPXt0aGlzLmNsYXNzfVxuXHRcdFx0Lz5cblx0XHQpIGFzIE9iamVjdE1hcmtlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjb250ZW50IG9mIHRoaXMgYnVpbGRpbmcgYmxvY2sgZm9yIHRoZSBcIkljb25Pbmx5XCIgdHlwZS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGNvbnRyb2wgdHJlZVxuXHQgKi9cblx0Z2V0SWNvbk9ubHlDb250ZW50KCkge1xuXHRcdGNvbnN0IHR5cGUgPSBpZkVsc2UoXG5cdFx0XHRub3QoRW50aXR5LklzQWN0aXZlKSxcblx0XHRcdE9iamVjdE1hcmtlclR5cGUuRHJhZnQsXG5cdFx0XHRpZkVsc2UoXG5cdFx0XHRcdEVudGl0eS5IYXNEcmFmdCxcblx0XHRcdFx0aWZFbHNlKHBhdGhJbk1vZGVsKFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvSW5Qcm9jZXNzQnlVc2VyXCIpLCBPYmplY3RNYXJrZXJUeXBlLkxvY2tlZCwgT2JqZWN0TWFya2VyVHlwZS5VbnNhdmVkKSxcblx0XHRcdFx0T2JqZWN0TWFya2VyVHlwZS5GbGFnZ2VkXG5cdFx0XHQpXG5cdFx0KTtcblx0XHRjb25zdCB2aXNpYmxlID0gYW5kKG5vdChVSS5Jc0VkaXRhYmxlKSwgRW50aXR5Lkhhc0RyYWZ0LCBub3QocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9EcmFmdElzQ3JlYXRlZEJ5TWVcIikpKTtcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8T2JqZWN0TWFya2VyXG5cdFx0XHRcdHR5cGU9e3R5cGV9XG5cdFx0XHRcdHByZXNzPXt0aGlzLm9uT2JqZWN0TWFya2VyUHJlc3NlZC5iaW5kKHRoaXMpfVxuXHRcdFx0XHR2aXNpYmlsaXR5PXtPYmplY3RNYXJrZXJWaXNpYmlsaXR5Lkljb25Pbmx5fVxuXHRcdFx0XHR2aXNpYmxlPXt2aXNpYmxlfVxuXHRcdFx0XHRhcmlhTGFiZWxsZWRCeT17dGhpcy5hcmlhTGFiZWxsZWRCeSA/IFt0aGlzLmFyaWFMYWJlbGxlZEJ5XSA6IFtdfVxuXHRcdFx0XHRjbGFzcz17dGhpcy5jbGFzc31cblx0XHRcdC8+XG5cdFx0KSBhcyBPYmplY3RNYXJrZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY29udGVudCBvZiB0aGlzIGJ1aWxkaW5nIGJsb2NrLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY29udHJvbCB0cmVlXG5cdCAqL1xuXHRnZXRDb250ZW50KCkge1xuXHRcdGlmICh0aGlzLmRyYWZ0SW5kaWNhdG9yVHlwZSA9PT0gT2JqZWN0TWFya2VyVmlzaWJpbGl0eS5JY29uQW5kVGV4dCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0SWNvbkFuZFRleHRDb250ZW50KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmdldEljb25Pbmx5Q29udGVudCgpO1xuXHRcdH1cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQWlDcUJBLG1CQUFtQjtFQWJ4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFYQSxPQVlDQyxtQkFBbUIsQ0FBQztJQUFFQyxJQUFJ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