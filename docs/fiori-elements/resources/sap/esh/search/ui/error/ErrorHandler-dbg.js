/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/base/Log", "sap/m/MessageBox", "sap/ui/core/library", "../i18n"], function (Log, MessageBox, sap_ui_core_library, __i18n) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var MessageType = sap_ui_core_library["MessageType"];
  var TextDirection = sap_ui_core_library["TextDirection"];
  var i18n = _interopRequireDefault(__i18n);
  var ErrorHandler = /*#__PURE__*/function () {
    function ErrorHandler() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      _classCallCheck(this, ErrorHandler);
      _defineProperty(this, "_oLogger", Log.getLogger("sap.esh.search.ui.error.ErrorHandler"));
      this.searchModel = properties.model;
      this.fnOnError = properties.fnOnError || this.defaultErrorHandler;
    }
    _createClass(ErrorHandler, [{
      key: "_getLoggableError",
      value: function _getLoggableError(error) {
        var logMessage = error + "";
        if (typeof error.stack !== "undefined") {
          logMessage = error.stack + "\n";
        }
        if (error.previous instanceof Error) {
          logMessage += "Previous error was: ".concat(this._getLoggableError(error.previous), "\n");
        }
        return logMessage;
      }
    }, {
      key: "_addUI5LogMessage",
      value: function _addUI5LogMessage(error, title) {
        // add technical details to the log:
        var logMessage = this._getLoggableError(error) + "\n";
        if (this.searchModel && this.searchModel.sinaNext) {
          logMessage += this.searchModel.sinaNext.getDebugInfo() + "\n";
        }
        this._oLogger.error(title, logMessage, "ErrorHandler");
      }
    }, {
      key: "_openMessageBox",
      value: function _openMessageBox(title, message, solution, details) {
        MessageBox.error(message + "\n" + solution + "\n" + details, {
          title: title,
          onClose: null,
          styleClass: "",
          initialFocus: null,
          textDirection: TextDirection.Inherit
        });
      }
    }, {
      key: "setSearchModel",
      value: function setSearchModel(model) {
        this.searchModel = model;
      }
    }, {
      key: "onError",
      value: function onError(error) {
        return this.fnOnError(error);
      }
    }, {
      key: "onErrorDeferred",
      value: function onErrorDeferred(error) {
        this.onError(error);
        return Promise.resolve(true);
      }
    }, {
      key: "defaultErrorHandler",
      value: function defaultErrorHandler(error) {
        var type = MessageType.Error;
        var title = error.name || i18n.getText("searchError");
        var message = error.message || i18n.getText("error.message");
        var solution = error.solution || i18n.getText("error.solution");
        var details = i18n.getText("error.details");

        // special error handling, should only be necessary if not already done in errors.js:
        switch (error.name) {
          case "TypeError":
            {
              message = i18n.getText("error.TypeError.message");
              solution = i18n.getText("error.TypeError.solution");
            }
            break;
          case "URIError":
            {
              solution = i18n.getText("error.URIError.solution");
            }
            break;
          case "DataSourceAttributeMetadataNotFoundError":
            {
              message = i18n.getText("error.sina.DataSourceAttributeMetadataNotFoundError.message");
              solution = i18n.getText("error.sina.DataSourceAttributeMetadataNotFoundError.solution");
            }
            break;
          case "NoValidEnterpriseSearchAPIConfigurationFoundError":
            {
              message = i18n.getText("error.sina.NoValidEnterpriseSearchAPIConfigurationFoundError.message") + "\n" + error.message; // add tried providers
              solution = i18n.getText("error.sina.NoValidEnterpriseSearchAPIConfigurationFoundError.solution");
            }
            break;
          case "InBetweenConditionInConsistent":
            {
              message = i18n.getText("error.sina.InBetweenConditionInConsistent.description");
              solution = i18n.getText("error.sina.InBetweenConditionInConsistent.solution");
            }
        }
        if (typeof this.searchModel === "undefined" || this.searchModel === null) {
          // if no searchModel was given only log the error
          // this can happen if an error happened while creating the ui or a searchModel
          this._addUI5LogMessage(error, title);

          // open a messagebox as last resort:
          this._openMessageBox(title, message, solution, details);
          return;
        }

        // show the empty result list
        this.searchModel.setProperty("/boResults", []);
        this.searchModel.setProperty("/origBoResults", []);
        this.searchModel.setProperty("/boCount", 0);
        this.searchModel.setProperty("/nlqSuccess", false);
        this.searchModel.setProperty("/nlqDescription", "");
        this.searchModel.busyIndicator.setBusy(false);

        // const stripUi5 = (text:string):string => {
        //     return text.replace(/<(?:.|\n)*?>|[{}]/gm, "");
        // };

        this._addUI5LogMessage(error, title);

        // create an error description which includes a solution:
        if (solution) {
          message = message + "\n\n" + solution + "\n\n " + details;
        }
        var uiMessage = {
          type: type,
          title: title,
          description: message
        };
        this.searchModel.pushUIMessage(uiMessage);
      }
    }]);
    return ErrorHandler;
  }();
  return ErrorHandler;
});
})();