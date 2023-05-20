/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ClassSupport", "sap/suite/ui/commons/collaboration/CollaborationHelper", "../MacroAPI"], function (Log, ClassSupport, CollaborationHelper, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block used to create the ‘Share’ functionality.
   * <br>
   * Please note that the 'Share in SAP Jam' option is only available on platforms that are integrated with SAP Jam.
   * <br>
   * If you are consuming this building block in an environment where the SAP Fiori launchpad is not available, then the 'Save as Tile' option is not visible.
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
   * @alias sap.fe.macros.ShareAPI
   * @private
   * @since 1.108.0
   */
  let ShareAPI = (_dec = defineUI5Class("sap.fe.macros.share.ShareAPI", {
    interfaces: ["sap.m.IOverflowToolbarContent"]
  }), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "boolean",
    defaultValue: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(ShareAPI, _MacroAPI);
    function ShareAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = ShareAPI.prototype;
    /**
     * Returns properties for the interface IOverflowToolbarContent.
     *
     * @returns {object} Returns the configuration of IOverflowToolbarContent
     */
    _proto.getOverflowToolbarConfig = function getOverflowToolbarConfig() {
      return {
        canOverflow: false
      };
    }

    /**
     * Sets the visibility of the 'Share' building block based on the value.
     * If the 'Share' building block is used in an application that's running in Microsoft Teams,
     * this function does not have any effect,
     * since the 'Share' building block handles the visibility on it's own in that case.
     *
     * @param visibility The desired visibility to be set
     * @returns Promise which resolves with the instance of ShareAPI
     * @private
     */;
    _proto.setVisibility = async function setVisibility(visibility) {
      const isTeamsModeActive = await CollaborationHelper.isTeamsModeActive();
      // In case of teams mode share should not be visible
      // so we do not do anything
      if (!isTeamsModeActive) {
        this.content.setVisible(visibility);
        this.visible = visibility;
      } else {
        Log.info("Share Building Block: visibility not changed since application is running in teams mode!");
      }
      return Promise.resolve(this);
    };
    return ShareAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ShareAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFyZUFQSSIsImRlZmluZVVJNUNsYXNzIiwiaW50ZXJmYWNlcyIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImdldE92ZXJmbG93VG9vbGJhckNvbmZpZyIsImNhbk92ZXJmbG93Iiwic2V0VmlzaWJpbGl0eSIsInZpc2liaWxpdHkiLCJpc1RlYW1zTW9kZUFjdGl2ZSIsIkNvbGxhYm9yYXRpb25IZWxwZXIiLCJjb250ZW50Iiwic2V0VmlzaWJsZSIsInZpc2libGUiLCJMb2ciLCJpbmZvIiwiUHJvbWlzZSIsInJlc29sdmUiLCJNYWNyb0FQSSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2hhcmVBUEkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBDb2xsYWJvcmF0aW9uSGVscGVyIGZyb20gXCJzYXAvc3VpdGUvdWkvY29tbW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25IZWxwZXJcIjtcbmltcG9ydCBNYWNyb0FQSSBmcm9tIFwiLi4vTWFjcm9BUElcIjtcbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgdXNlZCB0byBjcmVhdGUgdGhlIOKAmFNoYXJl4oCZIGZ1bmN0aW9uYWxpdHkuXG4gKiA8YnI+XG4gKiBQbGVhc2Ugbm90ZSB0aGF0IHRoZSAnU2hhcmUgaW4gU0FQIEphbScgb3B0aW9uIGlzIG9ubHkgYXZhaWxhYmxlIG9uIHBsYXRmb3JtcyB0aGF0IGFyZSBpbnRlZ3JhdGVkIHdpdGggU0FQIEphbS5cbiAqIDxicj5cbiAqIElmIHlvdSBhcmUgY29uc3VtaW5nIHRoaXMgYnVpbGRpbmcgYmxvY2sgaW4gYW4gZW52aXJvbm1lbnQgd2hlcmUgdGhlIFNBUCBGaW9yaSBsYXVuY2hwYWQgaXMgbm90IGF2YWlsYWJsZSwgdGhlbiB0aGUgJ1NhdmUgYXMgVGlsZScgb3B0aW9uIGlzIG5vdCB2aXNpYmxlLlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpTaGFyZVxuICogXHRpZD1cInNvbWVJRFwiXG4gKlx0dmlzaWJsZT1cInRydWVcIlxuICogLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLlNoYXJlQVBJXG4gKiBAcHJpdmF0ZVxuICogQHNpbmNlIDEuMTA4LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5zaGFyZS5TaGFyZUFQSVwiLCB7XG5cdGludGVyZmFjZXM6IFtcInNhcC5tLklPdmVyZmxvd1Rvb2xiYXJDb250ZW50XCJdXG59KVxuY2xhc3MgU2hhcmVBUEkgZXh0ZW5kcyBNYWNyb0FQSSB7XG5cdC8qKlxuXHQgKiBUaGUgaWRlbnRpZmllciBvZiB0aGUgJ1NoYXJlJyBidWlsZGluZyBibG9ja1xuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRpZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogV2hldGhlciB0aGUgJ1NoYXJlJyBidWlsZGluZyBibG9jayBpcyB2aXNpYmxlIG9yIG5vdC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0dmlzaWJsZSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFJldHVybnMgcHJvcGVydGllcyBmb3IgdGhlIGludGVyZmFjZSBJT3ZlcmZsb3dUb29sYmFyQ29udGVudC5cblx0ICpcblx0ICogQHJldHVybnMge29iamVjdH0gUmV0dXJucyB0aGUgY29uZmlndXJhdGlvbiBvZiBJT3ZlcmZsb3dUb29sYmFyQ29udGVudFxuXHQgKi9cblx0Z2V0T3ZlcmZsb3dUb29sYmFyQ29uZmlnKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjYW5PdmVyZmxvdzogZmFsc2Vcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlICdTaGFyZScgYnVpbGRpbmcgYmxvY2sgYmFzZWQgb24gdGhlIHZhbHVlLlxuXHQgKiBJZiB0aGUgJ1NoYXJlJyBidWlsZGluZyBibG9jayBpcyB1c2VkIGluIGFuIGFwcGxpY2F0aW9uIHRoYXQncyBydW5uaW5nIGluIE1pY3Jvc29mdCBUZWFtcyxcblx0ICogdGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBoYXZlIGFueSBlZmZlY3QsXG5cdCAqIHNpbmNlIHRoZSAnU2hhcmUnIGJ1aWxkaW5nIGJsb2NrIGhhbmRsZXMgdGhlIHZpc2liaWxpdHkgb24gaXQncyBvd24gaW4gdGhhdCBjYXNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmlzaWJpbGl0eSBUaGUgZGVzaXJlZCB2aXNpYmlsaXR5IHRvIGJlIHNldFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHJlc29sdmVzIHdpdGggdGhlIGluc3RhbmNlIG9mIFNoYXJlQVBJXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRhc3luYyBzZXRWaXNpYmlsaXR5KHZpc2liaWxpdHk6IGJvb2xlYW4pOiBQcm9taXNlPHRoaXM+IHtcblx0XHRjb25zdCBpc1RlYW1zTW9kZUFjdGl2ZSA9IGF3YWl0IENvbGxhYm9yYXRpb25IZWxwZXIuaXNUZWFtc01vZGVBY3RpdmUoKTtcblx0XHQvLyBJbiBjYXNlIG9mIHRlYW1zIG1vZGUgc2hhcmUgc2hvdWxkIG5vdCBiZSB2aXNpYmxlXG5cdFx0Ly8gc28gd2UgZG8gbm90IGRvIGFueXRoaW5nXG5cdFx0aWYgKCFpc1RlYW1zTW9kZUFjdGl2ZSkge1xuXHRcdFx0dGhpcy5jb250ZW50LnNldFZpc2libGUodmlzaWJpbGl0eSk7XG5cdFx0XHR0aGlzLnZpc2libGUgPSB2aXNpYmlsaXR5O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRMb2cuaW5mbyhcIlNoYXJlIEJ1aWxkaW5nIEJsb2NrOiB2aXNpYmlsaXR5IG5vdCBjaGFuZ2VkIHNpbmNlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gdGVhbXMgbW9kZSFcIik7XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcyk7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IFNoYXJlQVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0VBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQW5CQSxJQXVCTUEsUUFBUSxXQUhiQyxjQUFjLENBQUMsOEJBQThCLEVBQUU7SUFDL0NDLFVBQVUsRUFBRSxDQUFDLCtCQUErQjtFQUM3QyxDQUFDLENBQUMsVUFPQUMsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxVQVE1QkQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxTQUFTO0lBQUVDLFlBQVksRUFBRTtFQUFLLENBQUMsQ0FBQztJQUFBO0lBQUE7TUFBQTtNQUFBO1FBQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUdsRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBSkMsT0FLQUMsd0JBQXdCLEdBQXhCLG9DQUEyQjtNQUMxQixPQUFPO1FBQ05DLFdBQVcsRUFBRTtNQUNkLENBQUM7SUFDRjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVRDO0lBQUEsT0FVTUMsYUFBYSxHQUFuQiw2QkFBb0JDLFVBQW1CLEVBQWlCO01BQ3ZELE1BQU1DLGlCQUFpQixHQUFHLE1BQU1DLG1CQUFtQixDQUFDRCxpQkFBaUIsRUFBRTtNQUN2RTtNQUNBO01BQ0EsSUFBSSxDQUFDQSxpQkFBaUIsRUFBRTtRQUN2QixJQUFJLENBQUNFLE9BQU8sQ0FBQ0MsVUFBVSxDQUFDSixVQUFVLENBQUM7UUFDbkMsSUFBSSxDQUFDSyxPQUFPLEdBQUdMLFVBQVU7TUFDMUIsQ0FBQyxNQUFNO1FBQ05NLEdBQUcsQ0FBQ0MsSUFBSSxDQUFDLDBGQUEwRixDQUFDO01BQ3JHO01BQ0EsT0FBT0MsT0FBTyxDQUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQzdCLENBQUM7SUFBQTtFQUFBLEVBakRxQkMsUUFBUTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUEsT0FtRGhCbkIsUUFBUTtBQUFBIn0=