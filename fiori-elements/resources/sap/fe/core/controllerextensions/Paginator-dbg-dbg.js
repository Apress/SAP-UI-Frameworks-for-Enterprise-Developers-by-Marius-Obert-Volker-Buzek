/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/json/JSONModel"], function (ClassSupport, ControllerExtension, OverrideExecution, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * Controller extension providing hooks for the navigation using paginators
   *
   * @hideconstructor
   * @public
   * @since 1.94.0
   */
  let Paginator = (_dec = defineUI5Class("sap.fe.core.controllerextensions.Paginator"), _dec2 = methodOverride(), _dec3 = publicExtension(), _dec4 = finalExtension(), _dec5 = publicExtension(), _dec6 = finalExtension(), _dec7 = privateExtension(), _dec8 = extensible(OverrideExecution.After), _dec9 = privateExtension(), _dec10 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(Paginator, _ControllerExtension);
    function Paginator() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ControllerExtension.call(this, ...args) || this;
      _this._iCurrentIndex = -1;
      return _this;
    }
    var _proto = Paginator.prototype;
    _proto.onInit = function onInit() {
      this._oView = this.base.getView();
      this._oView.setModel(new JSONModel({
        navUpEnabled: false,
        navDownEnabled: false
      }), "paginator");
    }

    /**
     * Initiates the paginator control.
     *
     * @function
     * @param oBinding ODataListBinding object
     * @param oContext Current context where the navigation is initiated
     * @alias sap.fe.core.controllerextensions.Paginator#initialize
     * @public
     * @since 1.94.0
     */;
    _proto.initialize = function initialize(oBinding, oContext) {
      if (oBinding && oBinding.getAllCurrentContexts) {
        this._oListBinding = oBinding;
      }
      if (oContext) {
        this._oCurrentContext = oContext;
      }
      this._updateCurrentIndexAndButtonEnablement();
    };
    _proto._updateCurrentIndexAndButtonEnablement = function _updateCurrentIndexAndButtonEnablement() {
      if (this._oCurrentContext && this._oListBinding) {
        const sPath = this._oCurrentContext.getPath();
        // Storing the currentIndex in global variable
        this._iCurrentIndex = this._oListBinding.getAllCurrentContexts().findIndex(function (oContext) {
          return oContext && oContext.getPath() === sPath;
        });
        const oCurrentIndexContext = this._oListBinding.getAllCurrentContexts()[this._iCurrentIndex];
        if (!this._iCurrentIndex && this._iCurrentIndex !== 0 || !oCurrentIndexContext || this._oCurrentContext.getPath() !== oCurrentIndexContext.getPath()) {
          this._updateCurrentIndex();
        }
      }
      this._handleButtonEnablement();
    };
    _proto._handleButtonEnablement = function _handleButtonEnablement() {
      //Enabling and Disabling the Buttons on change of the control context
      const mButtonEnablementModel = this.base.getView().getModel("paginator");
      if (this._oListBinding && this._oListBinding.getAllCurrentContexts().length > 1 && this._iCurrentIndex > -1) {
        if (this._iCurrentIndex === this._oListBinding.getAllCurrentContexts().length - 1) {
          mButtonEnablementModel.setProperty("/navDownEnabled", false);
        } else if (this._oListBinding.getAllCurrentContexts()[this._iCurrentIndex + 1].isInactive()) {
          //check the next context is not an inactive context
          mButtonEnablementModel.setProperty("/navDownEnabled", false);
        } else {
          mButtonEnablementModel.setProperty("/navDownEnabled", true);
        }
        if (this._iCurrentIndex === 0) {
          mButtonEnablementModel.setProperty("/navUpEnabled", false);
        } else if (this._oListBinding.getAllCurrentContexts()[this._iCurrentIndex - 1].isInactive()) {
          mButtonEnablementModel.setProperty("/navUpEnabled", false);
        } else {
          mButtonEnablementModel.setProperty("/navUpEnabled", true);
        }
      } else {
        // Don't show the paginator buttons
        // 1. When no listbinding is available
        // 2. Only '1' or '0' context exists in the listBinding
        // 3. The current index is -ve, i.e the currentIndex is invalid.
        mButtonEnablementModel.setProperty("/navUpEnabled", false);
        mButtonEnablementModel.setProperty("/navDownEnabled", false);
      }
    };
    _proto._updateCurrentIndex = function _updateCurrentIndex() {
      if (this._oCurrentContext && this._oListBinding) {
        const sPath = this._oCurrentContext.getPath();
        // Storing the currentIndex in global variable
        this._iCurrentIndex = this._oListBinding.getAllCurrentContexts().findIndex(function (oContext) {
          return oContext && oContext.getPath() === sPath;
        });
      }
    };
    _proto.updateCurrentContext = async function updateCurrentContext(iDeltaIndex) {
      var _this$_oCurrentContex, _this$_oCurrentContex2;
      if (!this._oListBinding) {
        return;
      }
      const oModel = (_this$_oCurrentContex = this._oCurrentContext) !== null && _this$_oCurrentContex !== void 0 && _this$_oCurrentContex.getModel ? (_this$_oCurrentContex2 = this._oCurrentContext) === null || _this$_oCurrentContex2 === void 0 ? void 0 : _this$_oCurrentContex2.getModel() : undefined;
      //Submitting any pending changes that might be there before navigating to next context.
      await (oModel === null || oModel === void 0 ? void 0 : oModel.submitBatch("$auto"));
      const aCurrentContexts = this._oListBinding.getAllCurrentContexts();
      const iNewIndex = this._iCurrentIndex + iDeltaIndex;
      const oNewContext = aCurrentContexts[iNewIndex];
      if (oNewContext) {
        const bPreventIdxUpdate = this.onBeforeContextUpdate(this._oListBinding, this._iCurrentIndex, iDeltaIndex);
        if (!bPreventIdxUpdate) {
          this._iCurrentIndex = iNewIndex;
          this._oCurrentContext = oNewContext;
        }
        this.onContextUpdate(oNewContext);
      }
      this._handleButtonEnablement();
    }

    /**
     * Called before context update.
     *
     * @function
     * @param _oListBinding ODataListBinding object
     * @param _iCurrentIndex Current index of context in listBinding from where the navigation is initiated
     * @param _iIndexUpdate The delta index for update
     * @returns `true` to prevent the update of current context.
     * @alias sap.fe.core.controllerextensions.Paginator#onBeforeContextUpdate
     * @private
     */;
    _proto.onBeforeContextUpdate = function onBeforeContextUpdate(_oListBinding, _iCurrentIndex, _iIndexUpdate) {
      return false;
    }

    /**
     * Returns the updated context after the paginator operation.
     *
     * @function
     * @param oContext Final context returned after the paginator action
     * @alias sap.fe.core.controllerextensions.Paginator#onContextUpdate
     * @public
     * @since 1.94.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onContextUpdate = function onContextUpdate(oContext) {
      //To be overridden by the application
    };
    return Paginator;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "initialize", [_dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "initialize"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "updateCurrentContext", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "updateCurrentContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeContextUpdate", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeContextUpdate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onContextUpdate", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "onContextUpdate"), _class2.prototype)), _class2)) || _class);
  return Paginator;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWdpbmF0b3IiLCJkZWZpbmVVSTVDbGFzcyIsIm1ldGhvZE92ZXJyaWRlIiwicHVibGljRXh0ZW5zaW9uIiwiZmluYWxFeHRlbnNpb24iLCJwcml2YXRlRXh0ZW5zaW9uIiwiZXh0ZW5zaWJsZSIsIk92ZXJyaWRlRXhlY3V0aW9uIiwiQWZ0ZXIiLCJfaUN1cnJlbnRJbmRleCIsIm9uSW5pdCIsIl9vVmlldyIsImJhc2UiLCJnZXRWaWV3Iiwic2V0TW9kZWwiLCJKU09OTW9kZWwiLCJuYXZVcEVuYWJsZWQiLCJuYXZEb3duRW5hYmxlZCIsImluaXRpYWxpemUiLCJvQmluZGluZyIsIm9Db250ZXh0IiwiZ2V0QWxsQ3VycmVudENvbnRleHRzIiwiX29MaXN0QmluZGluZyIsIl9vQ3VycmVudENvbnRleHQiLCJfdXBkYXRlQ3VycmVudEluZGV4QW5kQnV0dG9uRW5hYmxlbWVudCIsInNQYXRoIiwiZ2V0UGF0aCIsImZpbmRJbmRleCIsIm9DdXJyZW50SW5kZXhDb250ZXh0IiwiX3VwZGF0ZUN1cnJlbnRJbmRleCIsIl9oYW5kbGVCdXR0b25FbmFibGVtZW50IiwibUJ1dHRvbkVuYWJsZW1lbnRNb2RlbCIsImdldE1vZGVsIiwibGVuZ3RoIiwic2V0UHJvcGVydHkiLCJpc0luYWN0aXZlIiwidXBkYXRlQ3VycmVudENvbnRleHQiLCJpRGVsdGFJbmRleCIsIm9Nb2RlbCIsInVuZGVmaW5lZCIsInN1Ym1pdEJhdGNoIiwiYUN1cnJlbnRDb250ZXh0cyIsImlOZXdJbmRleCIsIm9OZXdDb250ZXh0IiwiYlByZXZlbnRJZHhVcGRhdGUiLCJvbkJlZm9yZUNvbnRleHRVcGRhdGUiLCJvbkNvbnRleHRVcGRhdGUiLCJfaUluZGV4VXBkYXRlIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUGFnaW5hdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdGRlZmluZVVJNUNsYXNzLFxuXHRleHRlbnNpYmxlLFxuXHRmaW5hbEV4dGVuc2lvbixcblx0bWV0aG9kT3ZlcnJpZGUsXG5cdHByaXZhdGVFeHRlbnNpb24sXG5cdHB1YmxpY0V4dGVuc2lvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5cbi8qKlxuICogQ29udHJvbGxlciBleHRlbnNpb24gcHJvdmlkaW5nIGhvb2tzIGZvciB0aGUgbmF2aWdhdGlvbiB1c2luZyBwYWdpbmF0b3JzXG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuOTQuMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5QYWdpbmF0b3JcIilcbmNsYXNzIFBhZ2luYXRvciBleHRlbmRzIENvbnRyb2xsZXJFeHRlbnNpb24ge1xuXHRwcml2YXRlIF9vVmlldyE6IFZpZXc7XG5cblx0cHJvdGVjdGVkIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblxuXHRwcml2YXRlIF9vTGlzdEJpbmRpbmc6IGFueTtcblxuXHRwcml2YXRlIF9vQ3VycmVudENvbnRleHQ/OiBDb250ZXh0O1xuXG5cdHByaXZhdGUgX2lDdXJyZW50SW5kZXg6IG51bWJlciA9IC0xO1xuXG5cdEBtZXRob2RPdmVycmlkZSgpXG5cdG9uSW5pdCgpIHtcblx0XHR0aGlzLl9vVmlldyA9IHRoaXMuYmFzZS5nZXRWaWV3KCk7XG5cdFx0dGhpcy5fb1ZpZXcuc2V0TW9kZWwoXG5cdFx0XHRuZXcgSlNPTk1vZGVsKHtcblx0XHRcdFx0bmF2VXBFbmFibGVkOiBmYWxzZSxcblx0XHRcdFx0bmF2RG93bkVuYWJsZWQ6IGZhbHNlXG5cdFx0XHR9KSxcblx0XHRcdFwicGFnaW5hdG9yXCJcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYXRlcyB0aGUgcGFnaW5hdG9yIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gb0JpbmRpbmcgT0RhdGFMaXN0QmluZGluZyBvYmplY3Rcblx0ICogQHBhcmFtIG9Db250ZXh0IEN1cnJlbnQgY29udGV4dCB3aGVyZSB0aGUgbmF2aWdhdGlvbiBpcyBpbml0aWF0ZWRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlBhZ2luYXRvciNpbml0aWFsaXplXG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTQuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGluaXRpYWxpemUob0JpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcgfCBhbnksIG9Db250ZXh0PzogQ29udGV4dCkge1xuXHRcdGlmIChvQmluZGluZyAmJiBvQmluZGluZy5nZXRBbGxDdXJyZW50Q29udGV4dHMpIHtcblx0XHRcdHRoaXMuX29MaXN0QmluZGluZyA9IG9CaW5kaW5nO1xuXHRcdH1cblx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdHRoaXMuX29DdXJyZW50Q29udGV4dCA9IG9Db250ZXh0O1xuXHRcdH1cblx0XHR0aGlzLl91cGRhdGVDdXJyZW50SW5kZXhBbmRCdXR0b25FbmFibGVtZW50KCk7XG5cdH1cblxuXHRfdXBkYXRlQ3VycmVudEluZGV4QW5kQnV0dG9uRW5hYmxlbWVudCgpIHtcblx0XHRpZiAodGhpcy5fb0N1cnJlbnRDb250ZXh0ICYmIHRoaXMuX29MaXN0QmluZGluZykge1xuXHRcdFx0Y29uc3Qgc1BhdGggPSB0aGlzLl9vQ3VycmVudENvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0Ly8gU3RvcmluZyB0aGUgY3VycmVudEluZGV4IGluIGdsb2JhbCB2YXJpYWJsZVxuXHRcdFx0dGhpcy5faUN1cnJlbnRJbmRleCA9IHRoaXMuX29MaXN0QmluZGluZy5nZXRBbGxDdXJyZW50Q29udGV4dHMoKS5maW5kSW5kZXgoZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9Db250ZXh0ICYmIG9Db250ZXh0LmdldFBhdGgoKSA9PT0gc1BhdGg7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IG9DdXJyZW50SW5kZXhDb250ZXh0ID0gdGhpcy5fb0xpc3RCaW5kaW5nLmdldEFsbEN1cnJlbnRDb250ZXh0cygpW3RoaXMuX2lDdXJyZW50SW5kZXhdO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQoIXRoaXMuX2lDdXJyZW50SW5kZXggJiYgdGhpcy5faUN1cnJlbnRJbmRleCAhPT0gMCkgfHxcblx0XHRcdFx0IW9DdXJyZW50SW5kZXhDb250ZXh0IHx8XG5cdFx0XHRcdHRoaXMuX29DdXJyZW50Q29udGV4dC5nZXRQYXRoKCkgIT09IG9DdXJyZW50SW5kZXhDb250ZXh0LmdldFBhdGgoKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHRoaXMuX3VwZGF0ZUN1cnJlbnRJbmRleCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLl9oYW5kbGVCdXR0b25FbmFibGVtZW50KCk7XG5cdH1cblxuXHRfaGFuZGxlQnV0dG9uRW5hYmxlbWVudCgpIHtcblx0XHQvL0VuYWJsaW5nIGFuZCBEaXNhYmxpbmcgdGhlIEJ1dHRvbnMgb24gY2hhbmdlIG9mIHRoZSBjb250cm9sIGNvbnRleHRcblx0XHRjb25zdCBtQnV0dG9uRW5hYmxlbWVudE1vZGVsID0gdGhpcy5iYXNlLmdldFZpZXcoKS5nZXRNb2RlbChcInBhZ2luYXRvclwiKSBhcyBKU09OTW9kZWw7XG5cdFx0aWYgKHRoaXMuX29MaXN0QmluZGluZyAmJiB0aGlzLl9vTGlzdEJpbmRpbmcuZ2V0QWxsQ3VycmVudENvbnRleHRzKCkubGVuZ3RoID4gMSAmJiB0aGlzLl9pQ3VycmVudEluZGV4ID4gLTEpIHtcblx0XHRcdGlmICh0aGlzLl9pQ3VycmVudEluZGV4ID09PSB0aGlzLl9vTGlzdEJpbmRpbmcuZ2V0QWxsQ3VycmVudENvbnRleHRzKCkubGVuZ3RoIC0gMSkge1xuXHRcdFx0XHRtQnV0dG9uRW5hYmxlbWVudE1vZGVsLnNldFByb3BlcnR5KFwiL25hdkRvd25FbmFibGVkXCIsIGZhbHNlKTtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5fb0xpc3RCaW5kaW5nLmdldEFsbEN1cnJlbnRDb250ZXh0cygpW3RoaXMuX2lDdXJyZW50SW5kZXggKyAxXS5pc0luYWN0aXZlKCkpIHtcblx0XHRcdFx0Ly9jaGVjayB0aGUgbmV4dCBjb250ZXh0IGlzIG5vdCBhbiBpbmFjdGl2ZSBjb250ZXh0XG5cdFx0XHRcdG1CdXR0b25FbmFibGVtZW50TW9kZWwuc2V0UHJvcGVydHkoXCIvbmF2RG93bkVuYWJsZWRcIiwgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bUJ1dHRvbkVuYWJsZW1lbnRNb2RlbC5zZXRQcm9wZXJ0eShcIi9uYXZEb3duRW5hYmxlZFwiLCB0cnVlKTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLl9pQ3VycmVudEluZGV4ID09PSAwKSB7XG5cdFx0XHRcdG1CdXR0b25FbmFibGVtZW50TW9kZWwuc2V0UHJvcGVydHkoXCIvbmF2VXBFbmFibGVkXCIsIGZhbHNlKTtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5fb0xpc3RCaW5kaW5nLmdldEFsbEN1cnJlbnRDb250ZXh0cygpW3RoaXMuX2lDdXJyZW50SW5kZXggLSAxXS5pc0luYWN0aXZlKCkpIHtcblx0XHRcdFx0bUJ1dHRvbkVuYWJsZW1lbnRNb2RlbC5zZXRQcm9wZXJ0eShcIi9uYXZVcEVuYWJsZWRcIiwgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bUJ1dHRvbkVuYWJsZW1lbnRNb2RlbC5zZXRQcm9wZXJ0eShcIi9uYXZVcEVuYWJsZWRcIiwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIERvbid0IHNob3cgdGhlIHBhZ2luYXRvciBidXR0b25zXG5cdFx0XHQvLyAxLiBXaGVuIG5vIGxpc3RiaW5kaW5nIGlzIGF2YWlsYWJsZVxuXHRcdFx0Ly8gMi4gT25seSAnMScgb3IgJzAnIGNvbnRleHQgZXhpc3RzIGluIHRoZSBsaXN0QmluZGluZ1xuXHRcdFx0Ly8gMy4gVGhlIGN1cnJlbnQgaW5kZXggaXMgLXZlLCBpLmUgdGhlIGN1cnJlbnRJbmRleCBpcyBpbnZhbGlkLlxuXHRcdFx0bUJ1dHRvbkVuYWJsZW1lbnRNb2RlbC5zZXRQcm9wZXJ0eShcIi9uYXZVcEVuYWJsZWRcIiwgZmFsc2UpO1xuXHRcdFx0bUJ1dHRvbkVuYWJsZW1lbnRNb2RlbC5zZXRQcm9wZXJ0eShcIi9uYXZEb3duRW5hYmxlZFwiLCBmYWxzZSk7XG5cdFx0fVxuXHR9XG5cblx0X3VwZGF0ZUN1cnJlbnRJbmRleCgpIHtcblx0XHRpZiAodGhpcy5fb0N1cnJlbnRDb250ZXh0ICYmIHRoaXMuX29MaXN0QmluZGluZykge1xuXHRcdFx0Y29uc3Qgc1BhdGggPSB0aGlzLl9vQ3VycmVudENvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0Ly8gU3RvcmluZyB0aGUgY3VycmVudEluZGV4IGluIGdsb2JhbCB2YXJpYWJsZVxuXHRcdFx0dGhpcy5faUN1cnJlbnRJbmRleCA9IHRoaXMuX29MaXN0QmluZGluZy5nZXRBbGxDdXJyZW50Q29udGV4dHMoKS5maW5kSW5kZXgoZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9Db250ZXh0ICYmIG9Db250ZXh0LmdldFBhdGgoKSA9PT0gc1BhdGg7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgdXBkYXRlQ3VycmVudENvbnRleHQoaURlbHRhSW5kZXg6IGFueSkge1xuXHRcdGlmICghdGhpcy5fb0xpc3RCaW5kaW5nKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuX29DdXJyZW50Q29udGV4dD8uZ2V0TW9kZWwgPyB0aGlzLl9vQ3VycmVudENvbnRleHQ/LmdldE1vZGVsKCkgOiB1bmRlZmluZWQ7XG5cdFx0Ly9TdWJtaXR0aW5nIGFueSBwZW5kaW5nIGNoYW5nZXMgdGhhdCBtaWdodCBiZSB0aGVyZSBiZWZvcmUgbmF2aWdhdGluZyB0byBuZXh0IGNvbnRleHQuXG5cdFx0YXdhaXQgb01vZGVsPy5zdWJtaXRCYXRjaChcIiRhdXRvXCIpO1xuXHRcdGNvbnN0IGFDdXJyZW50Q29udGV4dHMgPSB0aGlzLl9vTGlzdEJpbmRpbmcuZ2V0QWxsQ3VycmVudENvbnRleHRzKCk7XG5cdFx0Y29uc3QgaU5ld0luZGV4ID0gdGhpcy5faUN1cnJlbnRJbmRleCArIGlEZWx0YUluZGV4O1xuXHRcdGNvbnN0IG9OZXdDb250ZXh0ID0gYUN1cnJlbnRDb250ZXh0c1tpTmV3SW5kZXhdO1xuXG5cdFx0aWYgKG9OZXdDb250ZXh0KSB7XG5cdFx0XHRjb25zdCBiUHJldmVudElkeFVwZGF0ZSA9IHRoaXMub25CZWZvcmVDb250ZXh0VXBkYXRlKHRoaXMuX29MaXN0QmluZGluZywgdGhpcy5faUN1cnJlbnRJbmRleCwgaURlbHRhSW5kZXgpO1xuXHRcdFx0aWYgKCFiUHJldmVudElkeFVwZGF0ZSkge1xuXHRcdFx0XHR0aGlzLl9pQ3VycmVudEluZGV4ID0gaU5ld0luZGV4O1xuXHRcdFx0XHR0aGlzLl9vQ3VycmVudENvbnRleHQgPSBvTmV3Q29udGV4dDtcblx0XHRcdH1cblx0XHRcdHRoaXMub25Db250ZXh0VXBkYXRlKG9OZXdDb250ZXh0KTtcblx0XHR9XG5cdFx0dGhpcy5faGFuZGxlQnV0dG9uRW5hYmxlbWVudCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCBiZWZvcmUgY29udGV4dCB1cGRhdGUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gX29MaXN0QmluZGluZyBPRGF0YUxpc3RCaW5kaW5nIG9iamVjdFxuXHQgKiBAcGFyYW0gX2lDdXJyZW50SW5kZXggQ3VycmVudCBpbmRleCBvZiBjb250ZXh0IGluIGxpc3RCaW5kaW5nIGZyb20gd2hlcmUgdGhlIG5hdmlnYXRpb24gaXMgaW5pdGlhdGVkXG5cdCAqIEBwYXJhbSBfaUluZGV4VXBkYXRlIFRoZSBkZWx0YSBpbmRleCBmb3IgdXBkYXRlXG5cdCAqIEByZXR1cm5zIGB0cnVlYCB0byBwcmV2ZW50IHRoZSB1cGRhdGUgb2YgY3VycmVudCBjb250ZXh0LlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUGFnaW5hdG9yI29uQmVmb3JlQ29udGV4dFVwZGF0ZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25CZWZvcmVDb250ZXh0VXBkYXRlKF9vTGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcsIF9pQ3VycmVudEluZGV4OiBudW1iZXIsIF9pSW5kZXhVcGRhdGU6IG51bWJlcikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB1cGRhdGVkIGNvbnRleHQgYWZ0ZXIgdGhlIHBhZ2luYXRvciBvcGVyYXRpb24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gb0NvbnRleHQgRmluYWwgY29udGV4dCByZXR1cm5lZCBhZnRlciB0aGUgcGFnaW5hdG9yIGFjdGlvblxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUGFnaW5hdG9yI29uQ29udGV4dFVwZGF0ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjk0LjBcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0b25Db250ZXh0VXBkYXRlKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Ly9UbyBiZSBvdmVycmlkZGVuIGJ5IHRoZSBhcHBsaWNhdGlvblxuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBQYWdpbmF0b3I7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkEsSUFRTUEsU0FBUyxXQURkQyxjQUFjLENBQUMsNENBQTRDLENBQUMsVUFZM0RDLGNBQWMsRUFBRSxVQXNCaEJDLGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBcUVoQkQsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsVUFrQ2hCQyxnQkFBZ0IsRUFBRSxVQUNsQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLFVBY25DSCxnQkFBZ0IsRUFBRSxXQUNsQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQSxNQWpKNUJDLGNBQWMsR0FBVyxDQUFDLENBQUM7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQUduQ0MsTUFBTSxHQUROLGtCQUNTO01BQ1IsSUFBSSxDQUFDQyxNQUFNLEdB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