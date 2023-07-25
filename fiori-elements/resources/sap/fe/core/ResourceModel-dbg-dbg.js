/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/model/resource/ResourceModel"], function (ClassSupport, UI5ResourceModel) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let ResourceModel = (_dec = defineUI5Class("sap.fe.core.ResourceModel"), _dec(_class = /*#__PURE__*/function (_UI5ResourceModel) {
    _inheritsLoose(ResourceModel, _UI5ResourceModel);
    function ResourceModel() {
      return _UI5ResourceModel.apply(this, arguments) || this;
    }
    var _proto = ResourceModel.prototype;
    /**
     * Returns text for a given resource key.
     *
     * @param textID ID of the Text
     * @param parameters Array of parameters that are used to create the text
     * @param metaPath Entity set name or action name to overload a text
     * @returns Determined text
     */
    _proto.getText = function getText(textID, parameters, metaPath) {
      let resourceKey = textID;
      const resourceBundle = this._oResourceBundle;
      if (metaPath) {
        const resourceKeyExists = this.checkIfResourceKeyExists(`${resourceKey}|${metaPath}`);

        // if resource key with metapath (i.e. entity set name) for instance specific text overriding is provided by the application
        // then use the same key otherwise use the Framework key
        resourceKey = resourceKeyExists ? `${resourceKey}|${metaPath}` : resourceKey;
      }
      return (resourceBundle === null || resourceBundle === void 0 ? void 0 : resourceBundle.getText(resourceKey, parameters, true)) || textID;
    }

    /**
     * Check if a text exists for a given resource key.
     *
     * @param textID ID of the Text
     * @returns True in case the text exists
     */;
    _proto.checkIfResourceKeyExists = function checkIfResourceKeyExists(textID) {
      // There are console errors logged when making calls to getText for keys that are not defined in the resource bundle
      // for instance keys which are supposed to be provided by the application, e.g, <key>|<entitySet> to override instance specific text
      // hence check if text exists (using "hasText") in the resource bundle before calling "getText"

      // "hasText" only checks for the key in the immediate resource bundle and not it's custom bundles
      // hence we need to do this recurrsively to check if the key exists in any of the bundles the forms the FE resource bundle
      return this._checkIfResourceKeyExists(textID, this._oResourceBundle.aCustomBundles);
    };
    _proto._checkIfResourceKeyExists = function _checkIfResourceKeyExists(textID, bundles) {
      if (bundles !== null && bundles !== void 0 && bundles.length) {
        for (let i = bundles.length - 1; i >= 0; i--) {
          const sValue = bundles[i].hasText(textID);
          // text found return true
          if (sValue) {
            return true;
          }
          this._checkIfResourceKeyExists(textID, bundles[i].aCustomBundles);
        }
      }
      return false;
    };
    return ResourceModel;
  }(UI5ResourceModel)) || _class);
  return ResourceModel;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXNvdXJjZU1vZGVsIiwiZGVmaW5lVUk1Q2xhc3MiLCJnZXRUZXh0IiwidGV4dElEIiwicGFyYW1ldGVycyIsIm1ldGFQYXRoIiwicmVzb3VyY2VLZXkiLCJyZXNvdXJjZUJ1bmRsZSIsIl9vUmVzb3VyY2VCdW5kbGUiLCJyZXNvdXJjZUtleUV4aXN0cyIsImNoZWNrSWZSZXNvdXJjZUtleUV4aXN0cyIsIl9jaGVja0lmUmVzb3VyY2VLZXlFeGlzdHMiLCJhQ3VzdG9tQnVuZGxlcyIsImJ1bmRsZXMiLCJsZW5ndGgiLCJpIiwic1ZhbHVlIiwiaGFzVGV4dCIsIlVJNVJlc291cmNlTW9kZWwiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlJlc291cmNlTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgUmVzb3VyY2VCdW5kbGUgZnJvbSBcInNhcC9iYXNlL2kxOG4vUmVzb3VyY2VCdW5kbGVcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgVUk1UmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL3Jlc291cmNlL1Jlc291cmNlTW9kZWxcIjtcblxudHlwZSBJbnRlcm5hbFJlc291cmNlQnVuZGxlID0gUmVzb3VyY2VCdW5kbGUgJiB7XG5cdGFDdXN0b21CdW5kbGVzOiBJbnRlcm5hbFJlc291cmNlQnVuZGxlW107XG59O1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5SZXNvdXJjZU1vZGVsXCIpXG5jbGFzcyBSZXNvdXJjZU1vZGVsIGV4dGVuZHMgVUk1UmVzb3VyY2VNb2RlbCB7XG5cdHByaXZhdGUgX29SZXNvdXJjZUJ1bmRsZSE6IEludGVybmFsUmVzb3VyY2VCdW5kbGU7XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGV4dCBmb3IgYSBnaXZlbiByZXNvdXJjZSBrZXkuXG5cdCAqXG5cdCAqIEBwYXJhbSB0ZXh0SUQgSUQgb2YgdGhlIFRleHRcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMgQXJyYXkgb2YgcGFyYW1ldGVycyB0aGF0IGFyZSB1c2VkIHRvIGNyZWF0ZSB0aGUgdGV4dFxuXHQgKiBAcGFyYW0gbWV0YVBhdGggRW50aXR5IHNldCBuYW1lIG9yIGFjdGlvbiBuYW1lIHRvIG92ZXJsb2FkIGEgdGV4dFxuXHQgKiBAcmV0dXJucyBEZXRlcm1pbmVkIHRleHRcblx0ICovXG5cdGdldFRleHQodGV4dElEOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiB1bmtub3duW10sIG1ldGFQYXRoPzogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRsZXQgcmVzb3VyY2VLZXkgPSB0ZXh0SUQ7XG5cdFx0Y29uc3QgcmVzb3VyY2VCdW5kbGUgPSB0aGlzLl9vUmVzb3VyY2VCdW5kbGU7XG5cblx0XHRpZiAobWV0YVBhdGgpIHtcblx0XHRcdGNvbnN0IHJlc291cmNlS2V5RXhpc3RzID0gdGhpcy5jaGVja0lmUmVzb3VyY2VLZXlFeGlzdHMoYCR7cmVzb3VyY2VLZXl9fCR7bWV0YVBhdGh9YCk7XG5cblx0XHRcdC8vIGlmIHJlc291cmNlIGtleSB3aXRoIG1ldGFwYXRoIChpLmUuIGVudGl0eSBzZXQgbmFtZSkgZm9yIGluc3RhbmNlIHNwZWNpZmljIHRleHQgb3ZlcnJpZGluZyBpcyBwcm92aWRlZCBieSB0aGUgYXBwbGljYXRpb25cblx0XHRcdC8vIHRoZW4gdXNlIHRoZSBzYW1lIGtleSBvdGhlcndpc2UgdXNlIHRoZSBGcmFtZXdvcmsga2V5XG5cdFx0XHRyZXNvdXJjZUtleSA9IHJlc291cmNlS2V5RXhpc3RzID8gYCR7cmVzb3VyY2VLZXl9fCR7bWV0YVBhdGh9YCA6IHJlc291cmNlS2V5O1xuXHRcdH1cblxuXHRcdHJldHVybiByZXNvdXJjZUJ1bmRsZT8uZ2V0VGV4dChyZXNvdXJjZUtleSwgcGFyYW1ldGVycywgdHJ1ZSkgfHwgdGV4dElEO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIGEgdGV4dCBleGlzdHMgZm9yIGEgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0gdGV4dElEIElEIG9mIHRoZSBUZXh0XG5cdCAqIEByZXR1cm5zIFRydWUgaW4gY2FzZSB0aGUgdGV4dCBleGlzdHNcblx0ICovXG5cdGNoZWNrSWZSZXNvdXJjZUtleUV4aXN0cyh0ZXh0SUQ6IHN0cmluZykge1xuXHRcdC8vIFRoZXJlIGFyZSBjb25zb2xlIGVycm9ycyBsb2dnZWQgd2hlbiBtYWtpbmcgY2FsbHMgdG8gZ2V0VGV4dCBmb3Iga2V5cyB0aGF0IGFyZSBub3QgZGVmaW5lZCBpbiB0aGUgcmVzb3VyY2UgYnVuZGxlXG5cdFx0Ly8gZm9yIGluc3RhbmNlIGtleXMgd2hpY2ggYXJlIHN1cHBvc2VkIHRvIGJlIHByb3ZpZGVkIGJ5IHRoZSBhcHBsaWNhdGlvbiwgZS5nLCA8a2V5Pnw8ZW50aXR5U2V0PiB0byBvdmVycmlkZSBpbnN0YW5jZSBzcGVjaWZpYyB0ZXh0XG5cdFx0Ly8gaGVuY2UgY2hlY2sgaWYgdGV4dCBleGlzdHMgKHVzaW5nIFwiaGFzVGV4dFwiKSBpbiB0aGUgcmVzb3VyY2UgYnVuZGxlIGJlZm9yZSBjYWxsaW5nIFwiZ2V0VGV4dFwiXG5cblx0XHQvLyBcImhhc1RleHRcIiBvbmx5IGNoZWNrcyBmb3IgdGhlIGtleSBpbiB0aGUgaW1tZWRpYXRlIHJlc291cmNlIGJ1bmRsZSBhbmQgbm90IGl0J3MgY3VzdG9tIGJ1bmRsZXNcblx0XHQvLyBoZW5jZSB3ZSBuZWVkIHRvIGRvIHRoaXMgcmVjdXJyc2l2ZWx5IHRvIGNoZWNrIGlmIHRoZSBrZXkgZXhpc3RzIGluIGFueSBvZiB0aGUgYnVuZGxlcyB0aGUgZm9ybXMgdGhlIEZFIHJlc291cmNlIGJ1bmRsZVxuXHRcdHJldHVybiB0aGlzLl9jaGVja0lmUmVzb3VyY2VLZXlFeGlzdHModGV4dElELCB0aGlzLl9vUmVzb3VyY2VCdW5kbGUuYUN1c3RvbUJ1bmRsZXMpO1xuXHR9XG5cblx0X2NoZWNrSWZSZXNvdXJjZUtleUV4aXN0cyh0ZXh0SUQ6IHN0cmluZywgYnVuZGxlcz86IEludGVybmFsUmVzb3VyY2VCdW5kbGVbXSkge1xuXHRcdGlmIChidW5kbGVzPy5sZW5ndGgpIHtcblx0XHRcdGZvciAobGV0IGkgPSBidW5kbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRcdGNvbnN0IHNWYWx1ZSA9IGJ1bmRsZXNbaV0uaGFzVGV4dCh0ZXh0SUQpO1xuXHRcdFx0XHQvLyB0ZXh0IGZvdW5kIHJldHVybiB0cnVlXG5cdFx0XHRcdGlmIChzVmFsdWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl9jaGVja0lmUmVzb3VyY2VLZXlFeGlzdHModGV4dElELCBidW5kbGVzW2ldLmFDdXN0b21CdW5kbGVzKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlc291cmNlTW9kZWw7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7O01BU01BLGFBQWEsV0FEbEJDLGNBQWMsQ0FBQywyQkFBMkIsQ0FBQztJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFJM0M7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQVBDLE9BUUFDLE9BQU8sR0FBUCxpQkFBUUMsTUFBYyxFQUFFQyxVQUFzQixFQUFFQyxRQUFpQixFQUFVO01BQzFFLElBQUlDLFdBQVcsR0FBR0gsTUFBTTtNQUN4QixNQUFNSSxjQUFjLEdBQUcsSUFBSSxDQUFDQyxnQkFBZ0I7TUFFNUMsSUFBSUgsUUFBUSxFQUFFO1FBQ2IsTUFBTUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDQyx3QkFBd0IsQ0FBRSxHQUFFSixXQUFZLElBQUdELFFBQVMsRUFBQyxDQUFDOztRQUVyRjtRQUNBO1FBQ0FDLFdBQVcsR0FBR0csaUJBQWlCLEdBQUksR0FBRUgsV0FBWSxJQUFHRCxRQUFTLEVBQUMsR0FBR0MsV0FBVztNQUM3RTtNQUVBLE9BQU8sQ0FBQUMsY0FBYyxhQUFkQSxjQUFjLHVCQUFkQSxjQUFjLENBQUVMLE9BQU8sQ0FBQ0ksV0FBVyxFQUFFRixVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUlELE1BQU07SUFDeEU7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BTyx3QkFBd0IsR0FBeEIsa0NBQXlCUCxNQUFjLEVBQUU7TUFDeEM7TUFDQTtNQUNBOztNQUVBO01BQ0E7TUFDQSxPQUFPLElBQUksQ0FBQ1EseUJBQXlCLENBQUNSLE1BQU0sRUFBRSxJQUFJLENBQUNLLGdCQUFnQixDQUFDSSxjQUFjLENBQUM7SUFDcEYsQ0FBQztJQUFBLE9BRURELHlCQUF5QixHQUF6QixtQ0FBMEJSLE1BQWMsRUFBRVUsT0FBa0MsRUFBRTtNQUM3RSxJQUFJQSxPQUFPLGFBQVBBLE9BQU8sZUFBUEEsT0FBTyxDQUFFQyxNQUFNLEVBQUU7UUFDcEIsS0FBSyxJQUFJQyxDQUFDLEdBQUdGLE9BQU8sQ0FBQ0MsTUFBTSxHQUFHLENBQUMsRUFBRUMsQ0FBQyxJQUFJLENBQUMsRUFBRUEsQ0FBQyxFQUFFLEVBQUU7VUFDN0MsTUFBTUMsTUFBTSxHQUFHSCxPQUFPLENBQUNFLENBQUMsQ0FBQyxDQUFDRSxPQUFPLENBQUNkLE1BQU0sQ0FBQztVQUN6QztVQUNBLElBQUlhLE1BQU0sRUFBRTtZQUNYLE9BQU8sSUFBSTtVQUNaO1VBQ0EsSUFBSSxDQUFDTCx5QkFBeUIsQ0FBQ1IsTUFBTSxFQUFFVSxPQUFPLENBQUNFLENBQUMsQ0FBQyxDQUFDSCxjQUFjLENBQUM7UUFDbEU7TUFDRDtNQUNBLE9BQU8sS0FBSztJQUNiLENBQUM7SUFBQTtFQUFBLEVBdEQwQk0sZ0JBQWdCO0VBQUEsT0F5RDdCbEIsYUFBYTtBQUFBIn0=