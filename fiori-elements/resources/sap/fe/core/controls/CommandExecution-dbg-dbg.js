/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/CommandExecution", "sap/ui/core/Component", "sap/ui/core/Element", "sap/ui/core/Shortcut"], function (Log, ClassSupport, CoreCommandExecution, Component, Element, Shortcut) {
  "use strict";

  var _dec, _class, _class2;
  var _exports = {};
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let CommandExecution = (_dec = defineUI5Class("sap.fe.core.controls.CommandExecution"), _dec(_class = (_class2 = /*#__PURE__*/function (_CoreCommandExecution) {
    _inheritsLoose(CommandExecution, _CoreCommandExecution);
    function CommandExecution(sId, mSettings) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return _CoreCommandExecution.call(this, sId, mSettings) || this;
    }
    _exports = CommandExecution;
    var _proto = CommandExecution.prototype;
    _proto.setParent = function setParent(oParent) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _CoreCommandExecution.prototype.setParent.call(this, oParent);
      const aCommands = oParent.data("sap.ui.core.Shortcut");
      if (Array.isArray(aCommands) && aCommands.length > 0) {
        const oCommand = oParent.data("sap.ui.core.Shortcut")[aCommands.length - 1],
          oShortcut = oCommand.shortcutSpec;
        if (oShortcut) {
          // Check if single key shortcut
          for (const key in oShortcut) {
            if (oShortcut[key] && key !== "key") {
              return this;
            }
          }
        }
        return this;
      }
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      const oParent = this.getParent();
      if (oParent) {
        const oCommand = this._getCommandInfo();
        if (oCommand) {
          Shortcut.unregister(this.getParent(), oCommand.shortcut);
        }
        this._cleanupContext(oParent);
      }
      Element.prototype.destroy.apply(this, [bSuppressInvalidate]);
    };
    _proto.setVisible = function setVisible(bValue) {
      let oCommand,
        oParentControl = this.getParent(),
        oComponent;
      if (!oParentControl) {
        _CoreCommandExecution.prototype.setVisible.call(this, bValue);
      }
      while (!oComponent && oParentControl) {
        oComponent = Component.getOwnerComponentFor(oParentControl);
        oParentControl = oParentControl.getParent();
      }
      if (oComponent) {
        oCommand = oComponent.getCommand(this.getCommand());
        if (oCommand) {
          _CoreCommandExecution.prototype.setVisible.call(this, bValue);
        } else {
          Log.info("There is no shortcut definition registered in the manifest for the command : " + this.getCommand());
        }
      }
      return this;
    };
    return CommandExecution;
  }(CoreCommandExecution), _class2.executeCommand = command => {
    return event => {
      const commandExecution = CoreCommandExecution.find(event.getSource(), command);
      commandExecution === null || commandExecution === void 0 ? void 0 : commandExecution.trigger();
    };
  }, _class2)) || _class);
  _exports = CommandExecution;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb21tYW5kRXhlY3V0aW9uIiwiZGVmaW5lVUk1Q2xhc3MiLCJzSWQiLCJtU2V0dGluZ3MiLCJzZXRQYXJlbnQiLCJvUGFyZW50IiwiYUNvbW1hbmRzIiwiZGF0YSIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsIm9Db21tYW5kIiwib1Nob3J0Y3V0Iiwic2hvcnRjdXRTcGVjIiwia2V5IiwiZGVzdHJveSIsImJTdXBwcmVzc0ludmFsaWRhdGUiLCJnZXRQYXJlbnQiLCJfZ2V0Q29tbWFuZEluZm8iLCJTaG9ydGN1dCIsInVucmVnaXN0ZXIiLCJzaG9ydGN1dCIsIl9jbGVhbnVwQ29udGV4dCIsIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJhcHBseSIsInNldFZpc2libGUiLCJiVmFsdWUiLCJvUGFyZW50Q29udHJvbCIsIm9Db21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsImdldENvbW1hbmQiLCJMb2ciLCJpbmZvIiwiQ29yZUNvbW1hbmRFeGVjdXRpb24iLCJleGVjdXRlQ29tbWFuZCIsImNvbW1hbmQiLCJldmVudCIsImNvbW1hbmRFeGVjdXRpb24iLCJmaW5kIiwiZ2V0U291cmNlIiwidHJpZ2dlciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29tbWFuZEV4ZWN1dGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgQ29yZUNvbW1hbmRFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL0NvbW1hbmRFeGVjdXRpb25cIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IEVsZW1lbnQgZnJvbSBcInNhcC91aS9jb3JlL0VsZW1lbnRcIjtcbmltcG9ydCBTaG9ydGN1dCBmcm9tIFwic2FwL3VpL2NvcmUvU2hvcnRjdXRcIjtcblxudHlwZSAkQ29tbWFuZEV4ZWN1dGlvblNldHRpbmdzID0ge1xuXHR2aXNpYmxlOiBib29sZWFuIHwgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHRlbmFibGVkOiBib29sZWFuIHwgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHRleGVjdXRlOiBGdW5jdGlvbjtcblx0Y29tbWFuZDogc3RyaW5nO1xufTtcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkNvbW1hbmRFeGVjdXRpb25cIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRFeGVjdXRpb24gZXh0ZW5kcyBDb3JlQ29tbWFuZEV4ZWN1dGlvbiB7XG5cdGNvbnN0cnVjdG9yKHNJZD86IHN0cmluZyB8ICRDb21tYW5kRXhlY3V0aW9uU2V0dGluZ3MsIG1TZXR0aW5ncz86ICRDb21tYW5kRXhlY3V0aW9uU2V0dGluZ3MpIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHN1cGVyKHNJZCwgbVNldHRpbmdzKTtcblx0fVxuXG5cdHNldFBhcmVudChvUGFyZW50OiBhbnkpIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHN1cGVyLnNldFBhcmVudChvUGFyZW50KTtcblx0XHRjb25zdCBhQ29tbWFuZHMgPSBvUGFyZW50LmRhdGEoXCJzYXAudWkuY29yZS5TaG9ydGN1dFwiKTtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShhQ29tbWFuZHMpICYmIGFDb21tYW5kcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBvQ29tbWFuZCA9IG9QYXJlbnQuZGF0YShcInNhcC51aS5jb3JlLlNob3J0Y3V0XCIpW2FDb21tYW5kcy5sZW5ndGggLSAxXSxcblx0XHRcdFx0b1Nob3J0Y3V0ID0gb0NvbW1hbmQuc2hvcnRjdXRTcGVjO1xuXHRcdFx0aWYgKG9TaG9ydGN1dCkge1xuXHRcdFx0XHQvLyBDaGVjayBpZiBzaW5nbGUga2V5IHNob3J0Y3V0XG5cdFx0XHRcdGZvciAoY29uc3Qga2V5IGluIG9TaG9ydGN1dCkge1xuXHRcdFx0XHRcdGlmIChvU2hvcnRjdXRba2V5XSAmJiBrZXkgIT09IFwia2V5XCIpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9XG5cblx0ZGVzdHJveShiU3VwcHJlc3NJbnZhbGlkYXRlOiBib29sZWFuKSB7XG5cdFx0Y29uc3Qgb1BhcmVudCA9IHRoaXMuZ2V0UGFyZW50KCk7XG5cdFx0aWYgKG9QYXJlbnQpIHtcblx0XHRcdGNvbnN0IG9Db21tYW5kID0gdGhpcy5fZ2V0Q29tbWFuZEluZm8oKTtcblx0XHRcdGlmIChvQ29tbWFuZCkge1xuXHRcdFx0XHRTaG9ydGN1dC51bnJlZ2lzdGVyKHRoaXMuZ2V0UGFyZW50KCksIG9Db21tYW5kLnNob3J0Y3V0KTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX2NsZWFudXBDb250ZXh0KG9QYXJlbnQpO1xuXHRcdH1cblx0XHRFbGVtZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIFtiU3VwcHJlc3NJbnZhbGlkYXRlXSk7XG5cdH1cblxuXHRzZXRWaXNpYmxlKGJWYWx1ZTogYm9vbGVhbikge1xuXHRcdGxldCBvQ29tbWFuZCxcblx0XHRcdG9QYXJlbnRDb250cm9sID0gdGhpcy5nZXRQYXJlbnQoKSxcblx0XHRcdG9Db21wb25lbnQ6IGFueTtcblxuXHRcdGlmICghb1BhcmVudENvbnRyb2wpIHtcblx0XHRcdHN1cGVyLnNldFZpc2libGUoYlZhbHVlKTtcblx0XHR9XG5cblx0XHR3aGlsZSAoIW9Db21wb25lbnQgJiYgb1BhcmVudENvbnRyb2wpIHtcblx0XHRcdG9Db21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob1BhcmVudENvbnRyb2wpO1xuXHRcdFx0b1BhcmVudENvbnRyb2wgPSBvUGFyZW50Q29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHR9XG5cblx0XHRpZiAob0NvbXBvbmVudCkge1xuXHRcdFx0b0NvbW1hbmQgPSBvQ29tcG9uZW50LmdldENvbW1hbmQodGhpcy5nZXRDb21tYW5kKCkpO1xuXG5cdFx0XHRpZiAob0NvbW1hbmQpIHtcblx0XHRcdFx0c3VwZXIuc2V0VmlzaWJsZShiVmFsdWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0TG9nLmluZm8oXCJUaGVyZSBpcyBubyBzaG9ydGN1dCBkZWZpbml0aW9uIHJlZ2lzdGVyZWQgaW4gdGhlIG1hbmlmZXN0IGZvciB0aGUgY29tbWFuZCA6IFwiICsgdGhpcy5nZXRDb21tYW5kKCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHN0YXRpYyBleGVjdXRlQ29tbWFuZCA9IChjb21tYW5kOiBzdHJpbmcpID0+IHtcblx0XHRyZXR1cm4gKGV2ZW50OiBFdmVudCkgPT4ge1xuXHRcdFx0Y29uc3QgY29tbWFuZEV4ZWN1dGlvbiA9IChDb3JlQ29tbWFuZEV4ZWN1dGlvbiBhcyBhbnkpLmZpbmQoZXZlbnQuZ2V0U291cmNlKCksIGNvbW1hbmQpO1xuXHRcdFx0Y29tbWFuZEV4ZWN1dGlvbj8udHJpZ2dlcigpO1xuXHRcdH07XG5cdH07XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7OztNQWdCcUJBLGdC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