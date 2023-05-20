/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
sap.ui.define(["./errors", "./util"], function (___errors, ___util) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  /* global XMLHttpRequest, require */
  /* eslint-disable @typescript-eslint/no-this-alias */
  const _request = _async(function (properties) {
    if (typeof window !== "undefined") {
      return new Promise(function (resolve, reject) {
        // Browser
        // new http request
        var xhttp = new XMLHttpRequest();

        // callback handler
        xhttp.onreadystatechange = function () {
          if (xhttp.readyState == 4 && (xhttp.status == 200 || xhttp.status == 201 || xhttp.status == 204)) {
            resolve({
              data: xhttp.responseText || "{}",
              headers: parseHeaders(xhttp.getAllResponseHeaders())
            });
            return;
          }
          if (xhttp.readyState == 4) {
            reject(ajaxErrorFactory(xhttp, parseHeaders(xhttp.getAllResponseHeaders())));
          }
        };

        // add url parameters to url
        var url = addEncodedUrlParameters(properties.url, properties.parameters);

        // write headers to http request
        xhttp.open(properties.method, url, true);
        for (var headerName in properties.headers) {
          var headerValue = properties.headers[headerName];
          xhttp.setRequestHeader(headerName, headerValue);
        }

        // send
        xhttp.send(properties.data);
      });
    } else {
      // Node.js for testing only!!!
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      var fetch = require("node-fetch");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      var https = properties.url.startsWith("https") ? require("https") : require("http");
      var agent = new https.Agent({
        rejectUnauthorized: false
      });
      var config = {
        agent: agent,
        headers: properties.headers,
        method: properties.method
      };
      if (typeof properties.data !== "undefined") {
        config.body = properties.data;
      }
      var url = addEncodedUrlParameters(properties.url, properties.parameters);
      var mapToObj = function mapToObj(headerMap) {
        // node-fetch puts every value in an array somehow.
        // here we unpack it if array only has one value.
        var responseHeaders = {};
        for (var key in headerMap) {
          var value = headerMap[key];
          if (value instanceof Array && value.length === 1) {
            responseHeaders[key] = value[0];
          } else {
            responseHeaders[key] = value;
          }
        }
        return responseHeaders;
      };
      return _catch(function () {
        return _await(fetch(url, config), function (res) {
          if (res.ok) {
            return _await(res.text(), function (text) {
              return {
                data: text || "{}",
                headers: mapToObj(res.headers.raw())
              };
            });
          } else {
            const _res$statusText = res.statusText,
              _res$status = res.status;
            return _await(res.text(), function (_res$text) {
              throw ajaxErrorFactory({
                status: _res$status,
                statusText: _res$statusText,
                responseText: _res$text
              });
            });
          }
        });
      }, function (error) {
        throw ajaxErrorFactory(error);
      });
    }
  });
  var ajaxErrorFactory = ___errors["ajaxErrorFactory"];
  var InternalESHClientError = ___errors["InternalESHClientError"];
  var hasOwnProperty = ___util["hasOwnProperty"]; // import { Log } from "./Log";
  // const log = new Log("ajax");
  var RecordingMode;
  (function (RecordingMode) {
    RecordingMode["NONE"] = "none";
    RecordingMode["RECORD"] = "record";
    RecordingMode["REPLAY"] = "replay";
  })(RecordingMode || (RecordingMode = {}));
  function parseHeaders(header) {
    var headers = {};
    var lines = header.split("\n");
    for (var i = 0; i < lines.length; ++i) {
      var line = lines[i];
      var index = line.indexOf(":");
      if (index >= 0) {
        var name = line.slice(0, index).toLowerCase(); // headers are case insensitive -> normalize to lower case
        var value = line.slice(index + 1);
        headers[name] = value.trim();
      }
    }
    return headers;
  }
  function encodeUrlParameters(parameters) {
    var result = [];
    for (var name in parameters) {
      var value = parameters[name];
      result.push(encodeURIComponent(name) + "=" + encodeURIComponent(value + ""));
    }
    return result.join("&");
  }
  function addEncodedUrlParameters(url, parameters) {
    if (!parameters) {
      return url;
    }
    var encodedParameters = encodeUrlParameters(parameters);
    if (encodedParameters.length > 0) {
      url += "?" + encodedParameters;
    }
    return url;
  }
  function isNumberStringBooleanRecord(data) {
    for (var entry in data) {
      if (typeof data[entry] !== "boolean" && typeof data[entry] !== "string" && typeof data[entry] !== "number") {
        return false;
      }
    }
    return true;
  }
  var Client = /*#__PURE__*/function () {
    function Client(properties) {
      var _properties$recording;
      _classCallCheck(this, Client);
      this._client = new _Client(properties);
      this.recordOptions = {
        headers: properties.recordingHeaders,
        mode: (_properties$recording = properties.recordingMode) !== null && _properties$recording !== void 0 ? _properties$recording : RecordingMode.NONE,
        path: properties.recordingPath,
        requestNormalization: properties.requestNormalization || this._defaultRequestNormalization
      };
      if (typeof window !== "undefined" && this.recordOptions.mode !== RecordingMode.NONE) {
        throw new InternalESHClientError("Record/Replay is only supported on Node.js");
      }
      this.records = {};
      if (this.recordOptions.mode === RecordingMode.REPLAY) {
        this.records = require(properties.recordingPath);
      }
      this.authorization = undefined;
      if (properties.authorization) {
        this.authorization = {
          user: properties.authorization.user,
          password: properties.authorization.password
        };
      }
    }
    _createClass(Client, [{
      key: "_encodeObj",
      value: function _encodeObj(data) {
        var aResult = [];
        for (var prop in data) {
          if (Object.prototype.hasOwnProperty.call(data, prop)) {
            aResult.push(encodeURIComponent(prop) + "=" + encodeURIComponent(data[prop]));
          }
        }
        return aResult.join("&");
      }
    }, {
      key: "getJson",
      value: function getJson(url, data) {
        var that = this;
        if (data && isNumberStringBooleanRecord(data)) {
          var sData = "?" + that._encodeObj(data);
          url = url + sData;
        }
        if (that.recordOptions.mode === "none") {
          return that._client.getJson(url);
        }
        if (that.recordOptions.mode === "replay") {
          return that._replay(url, null);
        }
        return that._client.getJson(url).then(function (response) {
          return that._record(url, null, response);
        });
      }
    }, {
      key: "getXML",
      value: function getXML(url) {
        try {
          let _exit = false;
          const _this = this;
          var that = _this;
          if (that.recordOptions.mode === "none") {
            return _await(that._client.getXML(url));
          }
          return _await(_invoke(function () {
            if (that.recordOptions.mode === "replay") {
              return _await(that._replay(url, null), function (_that$_replay) {
                const _await$that$_replay$d = _that$_replay.data;
                _exit = true;
                return _await$that$_replay$d;
              });
            }
          }, function (_result) {
            return _exit ? _result : that._client.getXML(url).then(function (response) {
              return that._record(url, null, response);
            });
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "postJson",
      value: function postJson(url, payload) {
        // avoid to modifeid by the next call
        payload = JSON.parse(JSON.stringify(payload));
        var that = this;
        if (that.recordOptions.mode === "none") {
          return that._client.postJson(url, payload);
        }
        if (that.recordOptions.mode === "replay") {
          return that._replay(url, payload);
        }
        return that._client.postJson(url, payload).then(function (response) {
          return that._record(url, payload, response);
        });
      }
    }, {
      key: "mergeJson",
      value: function mergeJson(url, payload) {
        // avoid to modifeid by the next call
        payload = JSON.parse(JSON.stringify(payload));
        var that = this;
        if (that.recordOptions.mode === "none") {
          return that._client.mergeJson(url, payload);
        }
        if (that.recordOptions.mode === "replay") {
          return that._replay(url, payload);
        }
        return that._client.mergeJson(url, payload).then(function (response) {
          return that._record(url, payload, response);
        });
      }
    }, {
      key: "request",
      value: function request(properties) {
        return this._client.request(properties);
      }
    }, {
      key: "_record",
      value: function _record(url, payload, response) {
        var that = this;
        var key = url;
        var normalizedPayload = that.recordOptions.requestNormalization(payload);
        if (normalizedPayload) {
          key += JSON.stringify(normalizedPayload);
        }
        if (that.records[key] === undefined && key.indexOf("NotToRecord") === -1) {
          try {
            that.records[key] = JSON.parse(JSON.stringify(response.data));
          } catch (error) {
            if (error.name === "SyntaxError") {
              // result was probably a xml string
              that.records[key] = response + "";
            } else {
              throw error;
            }
          }
        }
        return that._client.putJson(that.recordOptions.path, that.records).then(function () {
          return response;
        });
      }

      // _recordXML(url: string, response: unknown): Promise<typeof response> {
      //     const that = this;
      //     const key = url;
      //     if (that.records[key] === undefined && key.indexOf("NotToRecord") === -1) {
      //         that.records[key] = response;
      //     }
      //     return that._client.putJson(that.recordOptions.path, that.records).then(function () {
      //         return response;
      //     });
      // }
    }, {
      key: "_replay",
      value: function _replay(url, payload) {
        try {
          const _this2 = this;
          var that = _this2;
          var key = url;
          var normalizedRequest = that.recordOptions.requestNormalization(payload);
          if (normalizedRequest) {
            key += JSON.stringify(normalizedRequest);
          }
          var record = _this2.records[key];
          switch (_typeof(record)) {
            case "object":
              {
                var data = JSON.parse(JSON.stringify(record)); // copy the object to avoid side effects
                var response = {
                  data: data
                };
                if (response.data.error || response.data.Error) {
                  return Promise.reject(ajaxErrorFactory({
                    responseText: JSON.stringify(data)
                  }));
                }
                return _await(response);
              }
            case "string":
              return _await({
                data: record
              });
            case "undefined":
              {
                throw new InternalESHClientError("No recording found for request '" + key + "' in file " + _this2.recordOptions.path);
              }
            default:
              throw new InternalESHClientError("Don't know how to serialize recording data of type " + _typeof(record));
          }
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_defaultRequestNormalization",
      value: function _defaultRequestNormalization(payload) {
        if (payload === null) {
          return "";
        }
        if (_typeof(payload) === "object" && hasOwnProperty(payload, "SessionID")) {
          delete payload.SessionID;
        }
        if (_typeof(payload) === "object" && hasOwnProperty(payload, "SessionTimestamp")) {
          delete payload.SessionTimestamp;
        }
        return payload;
      }
    }]);
    return Client;
  }();
  var _Client = /*#__PURE__*/function () {
    function _Client(properties) {
      var _properties$recording2;
      _classCallCheck(this, _Client);
      this.csrf = properties.csrf;
      this.csrfByPassCache = properties.csrfByPassCache || false;
      this.csrfToken = null;
      this.csrfFetchRequest = properties.csrfFetchRequest || null;
      this.getLanguage = properties === null || properties === void 0 ? void 0 : properties.getLanguage;
      this.recordOptions = {
        headers: properties.recordingHeaders,
        mode: (_properties$recording2 = properties.recordingMode) !== null && _properties$recording2 !== void 0 ? _properties$recording2 : RecordingMode.NONE,
        path: properties.recordingPath,
        requestNormalization: properties.requestNormalization
      };
      this.authorization = undefined;
      if (properties.authorization) {
        this.authorization = {
          user: properties.authorization.user,
          password: properties.authorization.password
        };
      }
      if (typeof window !== "undefined" && this.recordOptions.mode !== RecordingMode.NONE) {
        throw new Error("Record/Replay is only supported on Node.js");
      }
    }
    _createClass(_Client, [{
      key: "getJsonHeaders",
      value: function getJsonHeaders() {
        var header = {
          "Content-Type": "application/json",
          Accept: "application/json"
        };
        this.addLanguageToHeader(header);
        return header;
      }
    }, {
      key: "getXmlHeaders",
      value: function getXmlHeaders() {
        var header = {
          "Content-Type": "application/xml",
          Accept: "application/xml"
        };
        this.addLanguageToHeader(header);
        return header;
      }
    }, {
      key: "addLanguageToHeader",
      value: function addLanguageToHeader(header) {
        if (typeof this.getLanguage === "function") {
          try {
            header["Accept-Language"] = this.getLanguage();
          } catch (error) {
            throw ajaxErrorFactory(error);
          }
        }
      }
    }, {
      key: "getJson",
      value: function getJson(url) {
        try {
          const _this3 = this;
          return _await(_this3.request({
            headers: _this3.getJsonHeaders(),
            method: "GET",
            url: url
          }), function (response) {
            if (typeof response.data === "string") {
              response.data = JSON.parse(response.data);
            }
            return response;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "getXML",
      value: function getXML(url) {
        try {
          const _this4 = this;
          return _await(_this4.request({
            headers: _this4.getXmlHeaders(),
            method: "GET",
            url: url
          }), function (response) {
            return response.data;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "postJson",
      value: function postJson(url, data) {
        try {
          const _this5 = this;
          return _await(_this5.request({
            headers: _this5.getJsonHeaders(),
            method: "POST",
            url: url,
            data: JSON.stringify(data)
          }), function (response) {
            if (typeof response.data === "string") {
              response.data = JSON.parse(response.data);
            }
            return response;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "mergeJson",
      value: function mergeJson(url, data) {
        try {
          const _this6 = this;
          return _await(_this6.request({
            headers: _this6.getJsonHeaders(),
            method: "MERGE",
            url: url,
            data: JSON.stringify(data)
          }), function (response) {
            if (typeof response.data === "string") {
              response.data = JSON.parse(response.data);
            }
            return response;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "putJson",
      value: function putJson(file, data) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          var fs = require("fs");
          return _await(new Promise(function (resolve, reject) {
            fs.writeFile(file, JSON.stringify(data, null, 4), "utf8", function (error) {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_fetchCsrf",
      value: function _fetchCsrf() {
        if (this.csrfFetchRequestPromise) {
          return this.csrfFetchRequestPromise;
        }
        this.csrfFetchRequest.headers = this.csrfFetchRequest.headers || {};
        this.csrfFetchRequest.headers["x-csrf-token"] = "fetch";
        this.csrfFetchRequest.parameters = this.csrfFetchRequest.parameters || {};
        if (this.csrfByPassCache) {
          this.csrfFetchRequest.parameters._ = Date.now(); // bypass cache;
        }

        this.csrfFetchRequestPromise = _request(this.csrfFetchRequest).then(function (response) {
          this.csrfFetchRequestPromise = null;
          if (response.headers["set-cookie"]) {
            this.cookies = response.headers["set-cookie"].join("; ");
          }
          this.csrfToken = response.headers["x-csrf-token"];
          return response;
        }.bind(this));
        return this.csrfFetchRequestPromise;
      }
    }, {
      key: "_requestWithCsrf",
      value: function _requestWithCsrf(properties, renewCsrf) {
        try {
          let _exit2 = false;
          const _this7 = this;
          // if request is identical to csrf fetch request -> always fetch a new csrf token
          if (addEncodedUrlParameters(_this7.csrfFetchRequest.url, _this7.csrfFetchRequest.parameters) === addEncodedUrlParameters(properties.url, properties.parameters)) {
            return _await(_this7._fetchCsrf());
          }

          // no csrf -> fetch csrf and then call again _requestWithCsrf
          return _await(_invoke(function () {
            if (renewCsrf && !_this7.csrfToken) {
              return _await(_this7._fetchCsrf(), function () {
                const _this7$_requestWithCs = _this7._requestWithCsrf(properties, false);
                _exit2 = true;
                return _this7$_requestWithCs;
              });
            }
          }, function (_result2) {
            if (_exit2) return _result2;
            // do request with csrf token
            properties.headers = properties.headers || {};
            if (_this7.cookies) {
              properties.headers.Cookie = _this7.cookies;
            }
            properties.headers["x-csrf-token"] = _this7.csrfToken;
            return _request(properties)["catch"](function (error) {
              if (renewCsrf && error && error.responseHeaders && error.responseHeaders["x-csrf-token"] && error.responseHeaders["x-csrf-token"].toLowerCase() === "required") {
                return this._fetchCsrf().then(function () {
                  return this._requestWithCsrf(properties, false);
                }.bind(this));
              }
              return Promise.reject(error);
            }.bind(_this7));
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "request",
      value: function request(properties) {
        try {
          let _exit3 = false;
          const _this8 = this;
          properties.headers = Object.assign({}, properties.headers, _this8.recordOptions.headers);
          if (_this8.authorization !== undefined) {
            if (typeof Buffer === "function") {
              // node.js encode
              properties.headers.Authorization = "Basic " + Buffer.from(_this8.authorization.user + ":" + _this8.authorization.password).toString("base64");
            } else if (window && typeof window.btoa === "function") {
              // javascript encode
              properties.headers.Authorization = "Basic " + window.btoa(_this8.authorization.user + ":" + _this8.authorization.password);
            }
          }

          // check csrf is enabled
          return _await(_invoke(function () {
            if (!_this8.csrf) {
              if (_this8.cookies) {
                properties.headers.Cookie = _this8.cookies;
              }
              return _await(_request(properties), function (_await$_request) {
                _exit3 = true;
                return _await$_request;
              });
            }
          }, function (_result3) {
            if (_exit3) return _result3;
            // if csrf fetch request is not set -> treat first request as csrf fetch request
            if (!_this8.csrfFetchRequest) {
              _this8.csrfFetchRequest = properties;
            }

            // mainRequest with csrf renew if neccessary
            return _await(_this8._requestWithCsrf(properties, true));
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);
    return _Client;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.RecordingMode = RecordingMode;
  __exports.parseHeaders = parseHeaders;
  __exports.encodeUrlParameters = encodeUrlParameters;
  __exports.addEncodedUrlParameters = addEncodedUrlParameters;
  __exports.Client = Client;
  return __exports;
});
})();