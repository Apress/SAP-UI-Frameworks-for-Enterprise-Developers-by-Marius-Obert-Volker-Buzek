/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/message/Message", "../MacroAPI"], function (ClassSupport, Message, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Returns the first visible control in the FieldWrapper.
   *
   * @param oControl FieldWrapper
   * @returns The first visible control
   */
  function getControlInFieldWrapper(oControl) {
    if (oControl.isA("sap.fe.macros.controls.FieldWrapper")) {
      const oFieldWrapper = oControl;
      const aControls = oFieldWrapper.getEditMode() === "Display" ? [oFieldWrapper.getContentDisplay()] : oFieldWrapper.getContentEdit();
      if (aControls.length >= 1) {
        return aControls.length ? aControls[0] : undefined;
      }
    } else {
      return oControl;
    }
    return undefined;
  }

  /**
   * Building block for creating a field based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField or DataPoint annotation is expected, but the field can also be used to display a property from the entity type.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Field id="MyField" metaPath="MyProperty" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Field
   * @public
   */
  let FieldAPI = (_dec = defineUI5Class("sap.fe.macros.field.FieldAPI"), _dec2 = property({
    type: "boolean"
  }), _dec3 = property({
    type: "boolean"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string",
    expectedAnnotations: [],
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty", "Property"]
  }), _dec6 = event(), _dec7 = association({
    type: "sap.ui.core.Control",
    multiple: true,
    singularName: "ariaLabelledBy"
  }), _dec8 = property({
    type: "boolean"
  }), _dec9 = property({
    type: "sap.fe.macros.FieldFormatOptions"
  }), _dec10 = property({
    type: "string"
  }), _dec11 = property({
    type: "boolean"
  }), _dec12 = property({
    type: "boolean"
  }), _dec13 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(FieldAPI, _MacroAPI);
    function FieldAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call(this, ...args) || this;
      _initializerDefineProperty(_this, "editable", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "change", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "required", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObject", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collaborationEnabled", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor11, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FieldAPI.prototype;
    _proto.handleChange = function handleChange(oEvent) {
      this.fireChange({
        value: this.getValue(),
        isValid: oEvent.getParameter("valid")
      });
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      const oContent = this.content;
      if (oContent && oContent.isA(["sap.m.Button"]) && oContent.addAriaLabelledBy) {
        const aAriaLabelledBy = this.getAriaLabelledBy();
        for (let i = 0; i < aAriaLabelledBy.length; i++) {
          const sId = aAriaLabelledBy[i];
          const aAriaLabelledBys = oContent.getAriaLabelledBy() || [];
          if (aAriaLabelledBys.indexOf(sId) === -1) {
            oContent.addAriaLabelledBy(sId);
          }
        }
      }
    };
    _proto.enhanceAccessibilityState = function enhanceAccessibilityState(_oElement, mAriaProps) {
      const oParent = this.getParent();
      if (oParent && oParent.enhanceAccessibilityState) {
        // use FieldWrapper as control, but aria properties of rendered inner control.
        oParent.enhanceAccessibilityState(this, mAriaProps);
      }
      return mAriaProps;
    };
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      const oContent = this.content;
      return oContent && oContent.getAccessibilityInfo ? oContent.getAccessibilityInfo() : {};
    }

    /**
     * Returns the DOMNode ID to be used for the "labelFor" attribute.
     *
     * We forward the call of this method to the content control.
     *
     * @returns ID to be used for the <code>labelFor</code>
     */;
    _proto.getIdForLabel = function getIdForLabel() {
      const oContent = this.content;
      return oContent.getIdForLabel();
    }

    /**
     * Retrieves the current value of the field.
     *
     * @public
     * @returns The current value of the field
     */;
    _proto.getValue = function getValue() {
      var _oControl, _oControl2, _oControl3, _oControl4;
      let oControl = getControlInFieldWrapper(this.content);
      if (this.collaborationEnabled && (_oControl = oControl) !== null && _oControl !== void 0 && _oControl.isA("sap.m.HBox")) {
        oControl = oControl.getItems()[0];
      }
      if ((_oControl2 = oControl) !== null && _oControl2 !== void 0 && _oControl2.isA("sap.m.CheckBox")) {
        return oControl.getSelected();
      } else if ((_oControl3 = oControl) !== null && _oControl3 !== void 0 && _oControl3.isA("sap.m.InputBase")) {
        return oControl.getValue();
      } else if ((_oControl4 = oControl) !== null && _oControl4 !== void 0 && _oControl4.isA("sap.ui.mdc.Field")) {
        return oControl.getValue(); // FieldWrapper
      } else {
        throw "getting value not yet implemented for this field type";
      }
    }

    /**
     * Adds a message to the field.
     *
     * @param [parameters] The parameters to create message
     * @param parameters.type Type of the message
     * @param parameters.message Message text
     * @param parameters.description Message description
     * @param parameters.persistent True if the message is persistent
     * @returns The id of the message
     * @public
     */;
    _proto.addMessage = function addMessage(parameters) {
      const msgManager = this.getMessageManager();
      const oControl = getControlInFieldWrapper(this.content);
      let path; //target for oMessage
      if (oControl !== null && oControl !== void 0 && oControl.isA("sap.m.CheckBox")) {
        var _getBinding;
        path = (_getBinding = oControl.getBinding("selected")) === null || _getBinding === void 0 ? void 0 : _getBinding.getResolvedPath();
      } else if (oControl !== null && oControl !== void 0 && oControl.isA("sap.m.InputBase")) {
        var _getBinding2;
        path = (_getBinding2 = oControl.getBinding("value")) === null || _getBinding2 === void 0 ? void 0 : _getBinding2.getResolvedPath();
      } else if (oControl !== null && oControl !== void 0 && oControl.isA("sap.ui.mdc.Field")) {
        path = oControl.getBinding("value").getResolvedPath();
      }
      const oMessage = new Message({
        target: path,
        type: parameters.type,
        message: parameters.message,
        processor: oControl === null || oControl === void 0 ? void 0 : oControl.getModel(),
        description: parameters.description,
        persistent: parameters.persistent
      });
      msgManager.addMessages(oMessage);
      return oMessage.getId();
    }

    /**
     * Removes a message from the field.
     *
     * @param id The id of the message
     * @public
     */;
    _proto.removeMessage = function removeMessage(id) {
      const msgManager = this.getMessageManager();
      const arr = msgManager.getMessageModel().getData();
      const result = arr.find(e => e.id === id);
      if (result) {
        msgManager.removeMessages(result);
      }
    };
    _proto.getMessageManager = function getMessageManager() {
      return sap.ui.getCore().getMessageManager();
    };
    return FieldAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "editable", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "change", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "required", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "semanticObject", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "collaborationEnabled", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "handleChange", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "handleChange"), _class2.prototype)), _class2)) || _class);
  return FieldAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRDb250cm9sSW5GaWVsZFdyYXBwZXIiLCJvQ29udHJvbCIsImlzQSIsIm9GaWVsZFdyYXBwZXIiLCJhQ29udHJvbHMiLCJnZXRFZGl0TW9kZSIsImdldENvbnRlbnREaXNwbGF5IiwiZ2V0Q29udGVudEVkaXQiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJGaWVsZEFQSSIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwiZXhwZWN0ZWRBbm5vdGF0aW9ucyIsImV4cGVjdGVkVHlwZXMiLCJldmVudCIsImFzc29jaWF0aW9uIiwibXVsdGlwbGUiLCJzaW5ndWxhck5hbWUiLCJ4bWxFdmVudEhhbmRsZXIiLCJoYW5kbGVDaGFuZ2UiLCJvRXZlbnQiLCJmaXJlQ2hhbmdlIiwidmFsdWUiLCJnZXRWYWx1ZSIsImlzVmFsaWQiLCJnZXRQYXJhbWV0ZXIiLCJvbkJlZm9yZVJlbmRlcmluZyIsIm9Db250ZW50IiwiY29udGVudCIsImFkZEFyaWFMYWJlbGxlZEJ5IiwiYUFyaWFMYWJlbGxlZEJ5IiwiZ2V0QXJpYUxhYmVsbGVkQnkiLCJpIiwic0lkIiwiYUFyaWFMYWJlbGxlZEJ5cyIsImluZGV4T2YiLCJlbmhhbmNlQWNjZXNzaWJpbGl0eVN0YXRlIiwiX29FbGVtZW50IiwibUFyaWFQcm9wcyIsIm9QYXJlbnQiLCJnZXRQYXJlbnQiLCJnZXRBY2Nlc3NpYmlsaXR5SW5mbyIsImdldElkRm9yTGFiZWwiLCJjb2xsYWJvcmF0aW9uRW5hYmxlZCIsImdldEl0ZW1zIiwiZ2V0U2VsZWN0ZWQiLCJhZGRNZXNzYWdlIiwicGFyYW1ldGVycyIsIm1zZ01hbmFnZXIiLCJnZXRNZXNzYWdlTWFuYWdlciIsInBhdGgiLCJnZXRCaW5kaW5nIiwiZ2V0UmVzb2x2ZWRQYXRoIiwib01lc3NhZ2UiLCJNZXNzYWdlIiwidGFyZ2V0IiwibWVzc2FnZSIsInByb2Nlc3NvciIsImdldE1vZGVsIiwiZGVzY3JpcHRpb24iLCJwZXJzaXN0ZW50IiwiYWRkTWVzc2FnZXMiLCJnZXRJZCIsInJlbW92ZU1lc3NhZ2UiLCJpZCIsImFyciIsImdldE1lc3NhZ2VNb2RlbCIsImdldERhdGEiLCJyZXN1bHQiLCJmaW5kIiwiZSIsInJlbW92ZU1lc3NhZ2VzIiwic2FwIiwidWkiLCJnZXRDb3JlIiwiTWFjcm9BUEkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW5oYW5jZVdpdGhVSTUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGFzc29jaWF0aW9uLCBkZWZpbmVVSTVDbGFzcywgZXZlbnQsIHByb3BlcnR5LCB4bWxFdmVudEhhbmRsZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIEZpZWxkV3JhcHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9jb250cm9scy9GaWVsZFdyYXBwZXJcIjtcbmltcG9ydCB0eXBlIEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgdHlwZSBDaGVja0JveCBmcm9tIFwic2FwL20vQ2hlY2tCb3hcIjtcbmltcG9ydCB0eXBlIEhCb3ggZnJvbSBcInNhcC9tL0hCb3hcIjtcbmltcG9ydCB0eXBlIElucHV0QmFzZSBmcm9tIFwic2FwL20vSW5wdXRCYXNlXCI7XG5pbXBvcnQgdHlwZSBVSTVFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IE1lc3NhZ2UgZnJvbSBcInNhcC91aS9jb3JlL21lc3NhZ2UvTWVzc2FnZVwiO1xuaW1wb3J0IE1hY3JvQVBJIGZyb20gXCIuLi9NYWNyb0FQSVwiO1xuXG4vKipcbiAqIEFkZGl0aW9uYWwgZm9ybWF0IG9wdGlvbnMgZm9yIHRoZSBmaWVsZC5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5GaWVsZEZvcm1hdE9wdGlvbnNcbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IHR5cGUgRmllbGRGb3JtYXRPcHRpb25zID0ge1xuXHQvKipcblx0ICogIERlZmluZXMgaG93IHRoZSBmaWVsZCB2YWx1ZSBhbmQgYXNzb2NpYXRlZCB0ZXh0IHdpbGwgYmUgZGlzcGxheWVkIHRvZ2V0aGVyLjxici8+XG5cdCAqXG5cdCAqICBBbGxvd2VkIHZhbHVlcyBhcmUgXCJWYWx1ZVwiLCBcIkRlc2NyaXB0aW9uXCIsIFwiRGVzY3JpcHRpb25WYWx1ZVwiIGFuZCBcIlZhbHVlRGVzY3JpcHRpb25cIlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0ZGlzcGxheU1vZGU6IFwiVmFsdWVcIiB8IFwiRGVzY3JpcHRpb25cIiB8IFwiRGVzY3JpcHRpb25WYWx1ZVwiIHwgXCJWYWx1ZURlc2NyaXB0aW9uXCI7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIGlmIGFuZCBob3cgdGhlIGZpZWxkIG1lYXN1cmUgd2lsbCBiZSBkaXNwbGF5ZWQuPGJyLz5cblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIFwiSGlkZGVuXCIgYW5kIFwiUmVhZE9ubHlcIlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0bWVhc3VyZURpc3BsYXlNb2RlOiBcIkhpZGRlblwiIHwgXCJSZWFkT25seVwiO1xuXHQvKipcblx0ICogTWF4aW11bSBudW1iZXIgb2YgbGluZXMgZm9yIG11bHRpbGluZSB0ZXh0cyBpbiBlZGl0IG1vZGUuPGJyLz5cblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdHRleHRMaW5lc0VkaXQ6IG51bWJlcjtcblx0LyoqXG5cdCAqIE1heGltdW0gbnVtYmVyIG9mIGxpbmVzIHRoYXQgbXVsdGlsaW5lIHRleHRzIGluIGVkaXQgbW9kZSBjYW4gZ3JvdyB0by48YnIvPlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0dGV4dE1heExpbmVzOiBudW1iZXI7XG5cdC8qKlxuXHQgKiBNYXhpbXVtIG51bWJlciBvZiBjaGFyYWN0ZXJzIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgdGV4dCBmaWVsZCB0aGF0IGFyZSBzaG93biBpbml0aWFsbHkuPGJyLz5cblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdHRleHRNYXhDaGFyYWN0ZXJzRGlzcGxheTogbnVtYmVyO1xuXHQvKipcblx0ICogRGVmaW5lcyBob3cgdGhlIGZ1bGwgdGV4dCB3aWxsIGJlIGRpc3BsYXllZC48YnIvPlxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgXCJJblBsYWNlXCIgYW5kIFwiUG9wb3ZlclwiXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHR0ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5OiBcIkluUGxhY2VcIiB8IFwiUG9wb3ZlclwiO1xuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgY2hhcmFjdGVycyBmb3IgdGhlIG11bHRpbGluZSB0ZXh0IHZhbHVlLjxici8+XG5cdCAqXG5cdCAqIElmIGEgbXVsdGlsaW5lIHRleHQgZXhjZWVkcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgYWxsb3dlZCBjaGFyYWN0ZXJzLCB0aGUgY291bnRlciBiZWxvdyB0aGUgaW5wdXQgZmllbGQgZGlzcGxheXMgdGhlIGV4YWN0IG51bWJlci5cblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdHRleHRNYXhMZW5ndGg6IG51bWJlcjtcblx0LyoqXG5cdCAqIERlZmluZXMgaWYgdGhlIGRhdGUgcGFydCBvZiBhIGRhdGUgdGltZSB3aXRoIHRpbWV6b25lIGZpZWxkIHNob3VsZCBiZSBzaG93bi4gPGJyLz5cblx0ICpcblx0ICogVGhlIGRhdGVUaW1lT2Zmc2V0IGZpZWxkIG11c3QgaGF2ZSBhIHRpbWV6b25lIGFubm90YXRpb24uXG5cdCAqXG5cdCAqIFRoZSBkZWZhdWx0IHZhbHVlIGlzIHRydWUuXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHRzaG93RGF0ZTogYm9vbGVhbjtcblx0LyoqXG5cdCAqIERlZmluZXMgaWYgdGhlIHRpbWUgcGFydCBvZiBhIGRhdGUgdGltZSB3aXRoIHRpbWV6b25lIGZpZWxkIHNob3VsZCBiZSBzaG93bi4gPGJyLz5cblx0ICpcblx0ICogVGhlIGRhdGVUaW1lT2Zmc2V0IGZpZWxkIG11c3QgaGF2ZSBhIHRpbWV6b25lIGFubm90YXRpb24uXG5cdCAqXG5cdCAqIFRoZSBkZWZhdWx0IHZhbHVlIGlzIHRydWUuXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHRzaG93VGltZTogYm9vbGVhbjtcblx0LyoqXG5cdCAqIERlZmluZXMgaWYgdGhlIHRpbWV6b25lIHBhcnQgb2YgYSBkYXRlIHRpbWUgd2l0aCB0aW1lem9uZSBmaWVsZCBzaG91bGQgYmUgc2hvd24uIDxici8+XG5cdCAqXG5cdCAqIFRoZSBkYXRlVGltZU9mZnNldCBmaWVsZCBtdXN0IGhhdmUgYSB0aW1lem9uZSBhbm5vdGF0aW9uLlxuXHQgKlxuXHQgKiBUaGUgZGVmYXVsdCB2YWx1ZSBpcyB0cnVlLlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0c2hvd1RpbWV6b25lOiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCB2aXNpYmxlIGNvbnRyb2wgaW4gdGhlIEZpZWxkV3JhcHBlci5cbiAqXG4gKiBAcGFyYW0gb0NvbnRyb2wgRmllbGRXcmFwcGVyXG4gKiBAcmV0dXJucyBUaGUgZmlyc3QgdmlzaWJsZSBjb250cm9sXG4gKi9cbmZ1bmN0aW9uIGdldENvbnRyb2xJbkZpZWxkV3JhcHBlcihvQ29udHJvbDogQ29udHJvbCk6IENvbnRyb2wgfCB1bmRlZmluZWQge1xuXHRpZiAob0NvbnRyb2wuaXNBKFwic2FwLmZlLm1hY3Jvcy5jb250cm9scy5GaWVsZFdyYXBwZXJcIikpIHtcblx0XHRjb25zdCBvRmllbGRXcmFwcGVyID0gb0NvbnRyb2wgYXMgRW5oYW5jZVdpdGhVSTU8RmllbGRXcmFwcGVyPjtcblx0XHRjb25zdCBhQ29udHJvbHMgPSBvRmllbGRXcmFwcGVyLmdldEVkaXRNb2RlKCkgPT09IFwiRGlzcGxheVwiID8gW29GaWVsZFdyYXBwZXIuZ2V0Q29udGVudERpc3BsYXkoKV0gOiBvRmllbGRXcmFwcGVyLmdldENvbnRlbnRFZGl0KCk7XG5cdFx0aWYgKGFDb250cm9scy5sZW5ndGggPj0gMSkge1xuXHRcdFx0cmV0dXJuIGFDb250cm9scy5sZW5ndGggPyBhQ29udHJvbHNbMF0gOiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBvQ29udHJvbDtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIGZpZWxkIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIFVzdWFsbHksIGEgRGF0YUZpZWxkIG9yIERhdGFQb2ludCBhbm5vdGF0aW9uIGlzIGV4cGVjdGVkLCBidXQgdGhlIGZpZWxkIGNhbiBhbHNvIGJlIHVzZWQgdG8gZGlzcGxheSBhIHByb3BlcnR5IGZyb20gdGhlIGVudGl0eSB0eXBlLlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpGaWVsZCBpZD1cIk15RmllbGRcIiBtZXRhUGF0aD1cIk15UHJvcGVydHlcIiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuRmllbGRcbiAqIEBwdWJsaWNcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEFQSVwiKVxuY2xhc3MgRmllbGRBUEkgZXh0ZW5kcyBNYWNyb0FQSSB7XG5cdC8qKlxuXHQgKiBBbiBleHByZXNzaW9uIHRoYXQgYWxsb3dzIHlvdSB0byBjb250cm9sIHRoZSBlZGl0YWJsZSBzdGF0ZSBvZiB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIElmIHlvdSBkbyBub3Qgc2V0IGFueSBleHByZXNzaW9uLCBTQVAgRmlvcmkgZWxlbWVudHMgaG9va3MgaW50byB0aGUgc3RhbmRhcmQgbGlmZWN5Y2xlIHRvIGRldGVybWluZSBpZiB0aGUgcGFnZSBpcyBjdXJyZW50bHkgZWRpdGFibGUuXG5cdCAqIFBsZWFzZSBub3RlIHRoYXQgeW91IGNhbm5vdCBzZXQgYSBmaWVsZCB0byBlZGl0YWJsZSBpZiBpdCBoYXMgYmVlbiBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uIGFzIG5vdCBlZGl0YWJsZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQGRlcHJlY2F0ZWRcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGVkaXRhYmxlITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQW4gZXhwcmVzc2lvbiB0aGF0IGFsbG93cyB5b3UgdG8gY29udHJvbCB0aGUgcmVhZC1vbmx5IHN0YXRlIG9mIHRoZSBmaWVsZC5cblx0ICpcblx0ICogSWYgeW91IGRvIG5vdCBzZXQgYW55IGV4cHJlc3Npb24sIFNBUCBGaW9yaSBlbGVtZW50cyBob29rcyBpbnRvIHRoZSBzdGFuZGFyZCBsaWZlY3ljbGUgdG8gZGV0ZXJtaW5lIHRoZSBjdXJyZW50IHN0YXRlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRyZWFkT25seSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBpZGVudGlmaWVyIG9mIHRoZSBGaWVsZCBjb250cm9sLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSByZWxhdGl2ZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSBpbiB0aGUgbWV0YW1vZGVsLCBiYXNlZCBvbiB0aGUgY3VycmVudCBjb250ZXh0UGF0aC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGV4cGVjdGVkQW5ub3RhdGlvbnM6IFtdLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJQcm9wZXJ0eVwiXVxuXHR9KVxuXHRtZXRhUGF0aCE6IHN0cmluZztcblxuXHQvKipcblx0ICogQW4gZXZlbnQgY29udGFpbmluZyBkZXRhaWxzIGlzIHRyaWdnZXJlZCB3aGVuIHRoZSB2YWx1ZSBvZiB0aGUgZmllbGQgaXMgY2hhbmdlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGV2ZW50KClcblx0Y2hhbmdlITogRnVuY3Rpb247XG5cblx0QGFzc29jaWF0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIG11bHRpcGxlOiB0cnVlLCBzaW5ndWxhck5hbWU6IFwiYXJpYUxhYmVsbGVkQnlcIiB9KVxuXHRhcmlhTGFiZWxsZWRCeSE6IENvbnRyb2w7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0cmVxdWlyZWQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY2FuIGJlIGNvbmZpZ3VyZWQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5GaWVsZEZvcm1hdE9wdGlvbnNcIiB9KVxuXHRmb3JtYXRPcHRpb25zITogRmllbGRGb3JtYXRPcHRpb25zO1xuXG5cdC8qKlxuXHQgKiBPcHRpb24gdG8gYWRkIHNlbWFudGljIG9iamVjdHMgdG8gYSBmaWVsZC5cblx0ICogVmFsaWQgb3B0aW9ucyBhcmUgZWl0aGVyIGEgc2luZ2xlIHNlbWFudGljIG9iamVjdCwgYSBzdHJpbmdpZmllZCBhcnJheSBvZiBzZW1hbnRpYyBvYmplY3RzXG5cdCAqIG9yIGEgc2luZ2xlIGJpbmRpbmcgZXhwcmVzc2lvbiByZXR1cm5pbmcgZWl0aGVyIGEgc2luZ2xlIHNlbWFudGljIG9iamVjdCBvciBhbiBhcnJheSBvZiBzZW1hbnRpYyBvYmplY3RzXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0c2VtYW50aWNPYmplY3QhOiBzdHJpbmc7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0Y29sbGFib3JhdGlvbkVuYWJsZWQhOiBib29sZWFuO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHZpc2libGUhOiBib29sZWFuO1xuXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRoYW5kbGVDaGFuZ2Uob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdCh0aGlzIGFzIGFueSkuZmlyZUNoYW5nZSh7IHZhbHVlOiB0aGlzLmdldFZhbHVlKCksIGlzVmFsaWQ6IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2YWxpZFwiKSB9KTtcblx0fVxuXG5cdG9uQmVmb3JlUmVuZGVyaW5nKCkge1xuXHRcdGNvbnN0IG9Db250ZW50ID0gdGhpcy5jb250ZW50O1xuXHRcdGlmIChvQ29udGVudCAmJiBvQ29udGVudC5pc0E8QnV0dG9uPihbXCJzYXAubS5CdXR0b25cIl0pICYmIG9Db250ZW50LmFkZEFyaWFMYWJlbGxlZEJ5KSB7XG5cdFx0XHRjb25zdCBhQXJpYUxhYmVsbGVkQnkgPSAodGhpcyBhcyBhbnkpLmdldEFyaWFMYWJlbGxlZEJ5KCk7XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYUFyaWFMYWJlbGxlZEJ5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IHNJZCA9IGFBcmlhTGFiZWxsZWRCeVtpXTtcblx0XHRcdFx0Y29uc3QgYUFyaWFMYWJlbGxlZEJ5cyA9IG9Db250ZW50LmdldEFyaWFMYWJlbGxlZEJ5KCkgfHwgW107XG5cdFx0XHRcdGlmIChhQXJpYUxhYmVsbGVkQnlzLmluZGV4T2Yoc0lkKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRvQ29udGVudC5hZGRBcmlhTGFiZWxsZWRCeShzSWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZShfb0VsZW1lbnQ6IG9iamVjdCwgbUFyaWFQcm9wczogb2JqZWN0KTogb2JqZWN0IHtcblx0XHRjb25zdCBvUGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKTtcblxuXHRcdGlmIChvUGFyZW50ICYmIChvUGFyZW50IGFzIGFueSkuZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZSkge1xuXHRcdFx0Ly8gdXNlIEZpZWxkV3JhcHBlciBhcyBjb250cm9sLCBidXQgYXJpYSBwcm9wZXJ0aWVzIG9mIHJlbmRlcmVkIGlubmVyIGNvbnRyb2wuXG5cdFx0XHQob1BhcmVudCBhcyBhbnkpLmVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUodGhpcywgbUFyaWFQcm9wcyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1BcmlhUHJvcHM7XG5cdH1cblxuXHRnZXRBY2Nlc3NpYmlsaXR5SW5mbygpOiBPYmplY3Qge1xuXHRcdGNvbnN0IG9Db250ZW50ID0gdGhpcy5jb250ZW50O1xuXHRcdHJldHVybiBvQ29udGVudCAmJiBvQ29udGVudC5nZXRBY2Nlc3NpYmlsaXR5SW5mbyA/IG9Db250ZW50LmdldEFjY2Vzc2liaWxpdHlJbmZvKCkgOiB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBET01Ob2RlIElEIHRvIGJlIHVzZWQgZm9yIHRoZSBcImxhYmVsRm9yXCIgYXR0cmlidXRlLlxuXHQgKlxuXHQgKiBXZSBmb3J3YXJkIHRoZSBjYWxsIG9mIHRoaXMgbWV0aG9kIHRvIHRoZSBjb250ZW50IGNvbnRyb2wuXG5cdCAqXG5cdCAqIEByZXR1cm5zIElEIHRvIGJlIHVzZWQgZm9yIHRoZSA8Y29kZT5sYWJlbEZvcjwvY29kZT5cblx0ICovXG5cdGdldElkRm9yTGFiZWwoKTogc3RyaW5nIHtcblx0XHRjb25zdCBvQ29udGVudCA9IHRoaXMuY29udGVudDtcblx0XHRyZXR1cm4gb0NvbnRlbnQuZ2V0SWRGb3JMYWJlbCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGZpZWxkXG5cdCAqL1xuXHRnZXRWYWx1ZSgpOiBib29sZWFuIHwgc3RyaW5nIHtcblx0XHRsZXQgb0NvbnRyb2wgPSBnZXRDb250cm9sSW5GaWVsZFdyYXBwZXIodGhpcy5jb250ZW50KTtcblx0XHRpZiAodGhpcy5jb2xsYWJvcmF0aW9uRW5hYmxlZCAmJiBvQ29udHJvbD8uaXNBKFwic2FwLm0uSEJveFwiKSkge1xuXHRcdFx0b0NvbnRyb2wgPSAob0NvbnRyb2wgYXMgSEJveCkuZ2V0SXRlbXMoKVswXTtcblx0XHR9XG5cdFx0aWYgKG9Db250cm9sPy5pc0EoXCJzYXAubS5DaGVja0JveFwiKSkge1xuXHRcdFx0cmV0dXJuIChvQ29udHJvbCBhcyBDaGVja0JveCkuZ2V0U2VsZWN0ZWQoKTtcblx0XHR9IGVsc2UgaWYgKG9Db250cm9sPy5pc0EoXCJzYXAubS5JbnB1dEJhc2VcIikpIHtcblx0XHRcdHJldHVybiAob0NvbnRyb2wgYXMgSW5wdXRCYXNlKS5nZXRWYWx1ZSgpO1xuXHRcdH0gZWxzZSBpZiAob0NvbnRyb2w/LmlzQShcInNhcC51aS5tZGMuRmllbGRcIikpIHtcblx0XHRcdHJldHVybiAob0NvbnRyb2wgYXMgYW55KS5nZXRWYWx1ZSgpOyAvLyBGaWVsZFdyYXBwZXJcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgXCJnZXR0aW5nIHZhbHVlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIHRoaXMgZmllbGQgdHlwZVwiO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgbWVzc2FnZSB0byB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIEBwYXJhbSBbcGFyYW1ldGVyc10gVGhlIHBhcmFtZXRlcnMgdG8gY3JlYXRlIG1lc3NhZ2Vcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMudHlwZSBUeXBlIG9mIHRoZSBtZXNzYWdlXG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzLm1lc3NhZ2UgTWVzc2FnZSB0ZXh0XG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzLmRlc2NyaXB0aW9uIE1lc3NhZ2UgZGVzY3JpcHRpb25cblx0ICogQHBhcmFtIHBhcmFtZXRlcnMucGVyc2lzdGVudCBUcnVlIGlmIHRoZSBtZXNzYWdlIGlzIHBlcnNpc3RlbnRcblx0ICogQHJldHVybnMgVGhlIGlkIG9mIHRoZSBtZXNzYWdlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFkZE1lc3NhZ2UocGFyYW1ldGVyczogeyB0eXBlPzogTWVzc2FnZVR5cGU7IG1lc3NhZ2U/OiBzdHJpbmc7IGRlc2NyaXB0aW9uPzogc3RyaW5nOyBwZXJzaXN0ZW50PzogYm9vbGVhbiB9KSB7XG5cdFx0Y29uc3QgbXNnTWFuYWdlciA9IHRoaXMuZ2V0TWVzc2FnZU1hbmFnZXIoKTtcblx0XHRjb25zdCBvQ29udHJvbCA9IGdldENvbnRyb2xJbkZpZWxkV3JhcHBlcih0aGlzLmNvbnRlbnQpO1xuXG5cdFx0bGV0IHBhdGg7IC8vdGFyZ2V0IGZvciBvTWVzc2FnZVxuXHRcdGlmIChvQ29udHJvbD8uaXNBKFwic2FwLm0uQ2hlY2tCb3hcIikpIHtcblx0XHRcdHBhdGggPSAob0NvbnRyb2wgYXMgQ2hlY2tCb3gpLmdldEJpbmRpbmcoXCJzZWxlY3RlZFwiKT8uZ2V0UmVzb2x2ZWRQYXRoKCk7XG5cdFx0fSBlbHNlIGlmIChvQ29udHJvbD8uaXNBKFwic2FwLm0uSW5wdXRCYXNlXCIpKSB7XG5cdFx0XHRwYXRoID0gKG9Db250cm9sIGFzIElucHV0QmFzZSkuZ2V0QmluZGluZyhcInZhbHVlXCIpPy5nZXRSZXNvbHZlZFBhdGgoKTtcblx0XHR9IGVsc2UgaWYgKG9Db250cm9sPy5pc0EoXCJzYXAudWkubWRjLkZpZWxkXCIpKSB7XG5cdFx0XHRwYXRoID0gKG9Db250cm9sIGFzIGFueSkuZ2V0QmluZGluZyhcInZhbHVlXCIpLmdldFJlc29sdmVkUGF0aCgpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9NZXNzYWdlID0gbmV3IE1lc3NhZ2Uoe1xuXHRcdFx0dGFyZ2V0OiBwYXRoLFxuXHRcdFx0dHlwZTogcGFyYW1ldGVycy50eXBlLFxuXHRcdFx0bWVzc2FnZTogcGFyYW1ldGVycy5tZXNzYWdlLFxuXHRcdFx0cHJvY2Vzc29yOiBvQ29udHJvbD8uZ2V0TW9kZWwoKSxcblx0XHRcdGRlc2NyaXB0aW9uOiBwYXJhbWV0ZXJzLmRlc2NyaXB0aW9uLFxuXHRcdFx0cGVyc2lzdGVudDogcGFyYW1ldGVycy5wZXJzaXN0ZW50XG5cdFx0fSk7XG5cblx0XHRtc2dNYW5hZ2VyLmFkZE1lc3NhZ2VzKG9NZXNzYWdlKTtcblx0XHRyZXR1cm4gb01lc3NhZ2UuZ2V0SWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbWVzc2FnZSBmcm9tIHRoZSBmaWVsZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBpZCBvZiB0aGUgbWVzc2FnZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRyZW1vdmVNZXNzYWdlKGlkOiBzdHJpbmcpIHtcblx0XHRjb25zdCBtc2dNYW5hZ2VyID0gdGhpcy5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHRcdGNvbnN0IGFyciA9IG1zZ01hbmFnZXIuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRcdGNvbnN0IHJlc3VsdCA9IGFyci5maW5kKChlOiBhbnkpID0+IGUuaWQgPT09IGlkKTtcblx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRtc2dNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKHJlc3VsdCk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0TWVzc2FnZU1hbmFnZXIoKSB7XG5cdFx0cmV0dXJuIHNhcC51aS5nZXRDb3JlKCkuZ2V0TWVzc2FnZU1hbmFnZXIoKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaWVsZEFQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQXNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQSx3QkFBd0IsQ0FBQ0MsUUFBaUIsRUFBdUI7SUFDekUsSUFBSUEsUUFBUSxDQUFDQyxHQUFHLENBQUMscUNBQXFDLENBQUMsRUFBRTtNQUN4RCxNQUFNQyxhQUFhLEdBQUdGLFFBQXdDO01BQzlELE1BQU1HLFNBQVMsR0FBR0QsYUFBYSxDQUFDRSxXQUFXLEVBQUUsS0FBSyxTQUFTLEdBQUcsQ0FBQ0YsYUFBYSxDQUFDRyxpQkFBaUIsRUFBRSxDQUFDLEdBQUdILGFBQWEsQ0FBQ0ksY0FBYyxFQUFFO01BQ2xJLElBQUlILFNBQVMsQ0FBQ0ksTUFBTSxJQUFJLENBQUMsRUFBRTtRQUMxQixPQUFPSixTQUFTLENBQUNJLE1BQU0sR0FBR0osU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHSyxTQUFTO01BQ25EO0lBQ0QsQ0FBQyxNQUFNO01BQ04sT0FBT1IsUUFBUTtJQUNoQjtJQUNBLE9BQU9RLFNBQVM7RUFDakI7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWJBLElBZU1DLFFBQVEsV0FEYkMsY0FBYyxDQUFDLDhCQUE4QixDQUFDLFVBVzdDQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFVBVTdCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFVBUTdCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBUTVCRCxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsbUJBQW1C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