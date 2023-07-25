/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/ID", "sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/InvisibleMessage", "sap/ui/core/library", "sap/ui/core/message/Message"], function (Log, CommonUtils, ID, ExtensionAPI, ClassSupport, InvisibleMessage, library, Message) {
  "use strict";

  var _dec, _class;
  var MessageType = library.MessageType;
  var InvisibleMessageMode = library.InvisibleMessageMode;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var getSideContentLayoutID = ID.getSideContentLayoutID;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Extension API for object pages on SAP Fiori elements for OData V4.
   *
   * To correctly integrate your app extension coding with SAP Fiori elements, use only the extensionAPI of SAP Fiori elements. Don't access or manipulate controls, properties, models, or other internal objects created by the SAP Fiori elements framework.
   *
   * @alias sap.fe.templates.ObjectPage.ExtensionAPI
   * @public
   * @hideconstructor
   * @final
   * @since 1.79.0
   */
  let ObjectPageExtensionAPI = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.ExtensionAPI"), _dec(_class = /*#__PURE__*/function (_ExtensionAPI) {
    _inheritsLoose(ObjectPageExtensionAPI, _ExtensionAPI);
    function ObjectPageExtensionAPI() {
      return _ExtensionAPI.apply(this, arguments) || this;
    }
    var _proto = ObjectPageExtensionAPI.prototype;
    /**
     * Refreshes either the whole object page or only parts of it.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#refresh
     * @param [vPath] Path or array of paths referring to entities or properties to be refreshed.
     * If omitted, the whole object page is refreshed. The path "" refreshes the entity assigned to the object page
     * without navigations
     * @returns Resolved once the data is refreshed or rejected if the request failed
     * @public
     */
    _proto.refresh = function refresh(vPath) {
      const oBindingContext = this._view.getBindingContext();
      if (!oBindingContext) {
        // nothing to be refreshed - do not block the app!
        return Promise.resolve();
      }
      const oAppComponent = CommonUtils.getAppComponent(this._view),
        oSideEffectsService = oAppComponent.getSideEffectsService(),
        oMetaModel = oBindingContext.getModel().getMetaModel(),
        oSideEffects = {
          targetProperties: [],
          targetEntities: []
        };
      let aPaths, sPath, sBaseEntitySet, sKind;
      if (vPath === undefined || vPath === null) {
        // we just add an empty path which should refresh the page with all dependent bindings
        oSideEffects.targetEntities.push({
          $NavigationPropertyPath: ""
        });
      } else {
        aPaths = Array.isArray(vPath) ? vPath : [vPath];
        sBaseEntitySet = this._controller.getOwnerComponent().getEntitySet();
        for (let i = 0; i < aPaths.length; i++) {
          sPath = aPaths[i];
          if (sPath === "") {
            // an empty path shall refresh the entity without dependencies which means * for the model
            oSideEffects.targetProperties.push("*");
          } else {
            sKind = oMetaModel.getObject(`/${sBaseEntitySet}/${sPath}/$kind`);
            if (sKind === "NavigationProperty") {
              oSideEffects.targetEntities.push({
                $NavigationPropertyPath: sPath
              });
            } else if (sKind) {
              oSideEffects.targetProperties.push(sPath);
            } else {
              return Promise.reject(`${sPath} is not a valid path to be refreshed`);
            }
          }
        }
      }
      return oSideEffectsService.requestSideEffects([...oSideEffects.targetEntities, ...oSideEffects.targetProperties], oBindingContext);
    }

    /**
     * Gets the list entries currently selected for the table.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getSelectedContexts
     * @param sTableId The ID identifying the table the selected context is requested for
     * @returns Array containing the selected contexts
     * @public
     */;
    _proto.getSelectedContexts = function getSelectedContexts(sTableId) {
      let oTable = this._view.byId(sTableId);
      if (oTable && oTable.isA("sap.fe.macros.table.TableAPI")) {
        oTable = oTable.getContent();
      }
      return oTable && oTable.isA("sap.ui.mdc.Table") && oTable.getSelectedContexts() || [];
    }

    /**
     * Displays or hides the side content of an object page.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showSideContent
     * @param sSubSectionKey Key of the side content fragment as defined in the manifest.json
     * @param [bShow] Optional Boolean flag to show or hide the side content
     * @public
     */;
    _proto.showSideContent = function showSideContent(sSubSectionKey, bShow) {
      const sBlockID = getSideContentLayoutID(sSubSectionKey),
        oBlock = this._view.byId(sBlockID),
        bBlockState = bShow === undefined ? !oBlock.getShowSideContent() : bShow;
      oBlock.setShowSideContent(bBlockState, false);
    }

    /**
     * Gets the bound context of the current object page.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getBindingContext
     * @returns Context bound to the object page
     * @public
     */;
    _proto.getBindingContext = function getBindingContext() {
      return this._view.getBindingContext();
    }

    /**
     * Build a message to be displayed below the anchor bar.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#_buildOPMessage
     * @param {sap.ui.core.message.Message[]} messages Array of messages used to generated the message
     * @returns {Promise<Message>} Promise containing the generated message
     * @private
     */;
    _proto._buildOPMessage = async function _buildOPMessage(messages) {
      const view = this._view;
      const resourceBundle = await view.getModel("sap.fe.i18n").getResourceBundle();
      let message = null;
      switch (messages.length) {
        case 0:
          break;
        case 1:
          message = messages[0];
          break;
        default:
          const messageStats = {
            Error: {
              id: 2,
              count: 0
            },
            Warning: {
              id: 1,
              count: 0
            },
            Information: {
              id: 0,
              count: 0
            }
          };
          message = messages.reduce((acc, currentValue) => {
            const currentType = currentValue.getType();
            acc.setType(messageStats[currentType].id > messageStats[acc.getType()].id ? currentType : acc.getType());
            messageStats[currentType].count++;
            return acc;
          }, new Message({
            type: MessageType.Information
          }));
          if (messageStats.Error.count === 0 && messageStats.Warning.count === 0 && messageStats.Information.count > 0) {
            message.setMessage(resourceBundle.getText("OBJECTPAGESTATE_INFORMATION"));
          } else if (messageStats.Error.count > 0 && messageStats.Warning.count > 0 || messageStats.Information.count > 0) {
            message.setMessage(resourceBundle.getText("OBJECTPAGESTATE_ISSUE"));
          } else {
            message.setMessage(resourceBundle.getText(message.getType() === MessageType.Error ? "OBJECTPAGESTATE_ERROR" : "OBJECTPAGESTATE_WARNING"));
          }
      }
      return message;
    }

    /**
     * Displays the message strip between the title and the header of the ObjectPage.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showMessages
     * @param {sap.ui.core.message.Message} messages The message to be displayed
     * @public
     */;
    _proto.showMessages = async function showMessages(messages) {
      const view = this._view;
      const internalModelContext = view.getBindingContext("internal");
      try {
        const message = await this._buildOPMessage(messages);
        if (message) {
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripVisibility", true);
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripText", message.getMessage());
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripType", message.getType());
          InvisibleMessage.getInstance().announce(message.getMessage(), InvisibleMessageMode.Assertive);
        } else {
          this.hideMessage();
        }
      } catch (err) {
        Log.error("Cannot display ObjectPage message");
      }
    }

    /**
     * Hides the message strip below the anchor bar.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#hideMessage
     * @public
     */;
    _proto.hideMessage = function hideMessage() {
      const view = this._view;
      const internalModelContext = view.getBindingContext("internal");
      internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripVisibility", false);
    };
    return ObjectPageExtensionAPI;
  }(ExtensionAPI)) || _class);
  return ObjectPageExtensionAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3RQYWdlRXh0ZW5zaW9uQVBJIiwiZGVmaW5lVUk1Q2xhc3MiLCJyZWZyZXNoIiwidlBhdGgiLCJvQmluZGluZ0NvbnRleHQiLCJfdmlldyIsImdldEJpbmRpbmdDb250ZXh0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJvQXBwQ29tcG9uZW50IiwiQ29tbW9uVXRpbHMiLCJnZXRBcHBDb21wb25lbnQiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwib1NpZGVFZmZlY3RzIiwidGFyZ2V0UHJvcGVydGllcyIsInRhcmdldEVudGl0aWVzIiwiYVBhdGhzIiwic1BhdGgiLCJzQmFzZUVudGl0eVNldCIsInNLaW5kIiwidW5kZWZpbmVkIiwicHVzaCIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiQXJyYXkiLCJpc0FycmF5IiwiX2NvbnRyb2xsZXIiLCJnZXRPd25lckNvbXBvbmVudCIsImdldEVudGl0eVNldCIsImkiLCJsZW5ndGgiLCJnZXRPYmplY3QiLCJyZWplY3QiLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJnZXRTZWxlY3RlZENvbnRleHRzIiwic1RhYmxlSWQiLCJvVGFibGUiLCJieUlkIiwiaXNBIiwiZ2V0Q29udGVudCIsInNob3dTaWRlQ29udGVudCIsInNTdWJTZWN0aW9uS2V5IiwiYlNob3ciLCJzQmxvY2tJRCIsImdldFNpZGVDb250ZW50TGF5b3V0SUQiLCJvQmxvY2siLCJiQmxvY2tTdGF0ZSIsImdldFNob3dTaWRlQ29udGVudCIsInNldFNob3dTaWRlQ29udGVudCIsIl9idWlsZE9QTWVzc2FnZSIsIm1lc3NhZ2VzIiwidmlldyIsInJlc291cmNlQnVuZGxlIiwiZ2V0UmVzb3VyY2VCdW5kbGUiLCJtZXNzYWdlIiwibWVzc2FnZVN0YXRzIiwiRXJyb3IiLCJpZCIsImNvdW50IiwiV2FybmluZyIsIkluZm9ybWF0aW9uIiwicmVkdWNlIiwiYWNjIiwiY3VycmVudFZhbHVlIiwiY3VycmVudFR5cGUiLCJnZXRUeXBlIiwic2V0VHlwZSIsIk1lc3NhZ2UiLCJ0eXBlIiwiTWVzc2FnZVR5cGUiLCJzZXRNZXNzYWdlIiwiZ2V0VGV4dCIsInNob3dNZXNzYWdlcyIsImludGVybmFsTW9kZWxDb250ZXh0Iiwic2V0UHJvcGVydHkiLCJnZXRNZXNzYWdlIiwiSW52aXNpYmxlTWVzc2FnZSIsImdldEluc3RhbmNlIiwiYW5ub3VuY2UiLCJJbnZpc2libGVNZXNzYWdlTW9kZSIsIkFzc2VydGl2ZSIsImhpZGVNZXNzYWdlIiwiZXJyIiwiTG9nIiwiZXJyb3IiLCJFeHRlbnNpb25BUEkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkV4dGVuc2lvbkFQSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGdldFNpZGVDb250ZW50TGF5b3V0SUQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgRXh0ZW5zaW9uQVBJIGZyb20gXCJzYXAvZmUvY29yZS9FeHRlbnNpb25BUElcIjtcbmltcG9ydCB0eXBlIHsgRW5oYW5jZVdpdGhVSTUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBTaWRlRWZmZWN0c1RhcmdldFR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgVGFibGVBUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVBUElcIjtcbmltcG9ydCBJbnZpc2libGVNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9JbnZpc2libGVNZXNzYWdlXCI7XG5pbXBvcnQgeyBJbnZpc2libGVNZXNzYWdlTW9kZSwgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IE1lc3NhZ2UgZnJvbSBcInNhcC91aS9jb3JlL21lc3NhZ2UvTWVzc2FnZVwiO1xuaW1wb3J0IHR5cGUgRHluYW1pY1NpZGVDb250ZW50IGZyb20gXCJzYXAvdWkvbGF5b3V0L0R5bmFtaWNTaWRlQ29udGVudFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvcmVzb3VyY2UvUmVzb3VyY2VNb2RlbFwiO1xuXG4vKipcbiAqIEV4dGVuc2lvbiBBUEkgZm9yIG9iamVjdCBwYWdlcyBvbiBTQVAgRmlvcmkgZWxlbWVudHMgZm9yIE9EYXRhIFY0LlxuICpcbiAqIFRvIGNvcnJlY3RseSBpbnRlZ3JhdGUgeW91ciBhcHAgZXh0ZW5zaW9uIGNvZGluZyB3aXRoIFNBUCBGaW9yaSBlbGVtZW50cywgdXNlIG9ubHkgdGhlIGV4dGVuc2lvbkFQSSBvZiBTQVAgRmlvcmkgZWxlbWVudHMuIERvbid0IGFjY2VzcyBvciBtYW5pcHVsYXRlIGNvbnRyb2xzLCBwcm9wZXJ0aWVzLCBtb2RlbHMsIG9yIG90aGVyIGludGVybmFsIG9iamVjdHMgY3JlYXRlZCBieSB0aGUgU0FQIEZpb3JpIGVsZW1lbnRzIGZyYW1ld29yay5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSVxuICogQHB1YmxpY1xuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQGZpbmFsXG4gKiBAc2luY2UgMS43OS4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5FeHRlbnNpb25BUElcIilcbmNsYXNzIE9iamVjdFBhZ2VFeHRlbnNpb25BUEkgZXh0ZW5kcyBFeHRlbnNpb25BUEkge1xuXHQvKipcblx0ICogUmVmcmVzaGVzIGVpdGhlciB0aGUgd2hvbGUgb2JqZWN0IHBhZ2Ugb3Igb25seSBwYXJ0cyBvZiBpdC5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5FeHRlbnNpb25BUEkjcmVmcmVzaFxuXHQgKiBAcGFyYW0gW3ZQYXRoXSBQYXRoIG9yIGFycmF5IG9mIHBhdGhzIHJlZmVycmluZyB0byBlbnRpdGllcyBvciBwcm9wZXJ0aWVzIHRvIGJlIHJlZnJlc2hlZC5cblx0ICogSWYgb21pdHRlZCwgdGhlIHdob2xlIG9iamVjdCBwYWdlIGlzIHJlZnJlc2hlZC4gVGhlIHBhdGggXCJcIiByZWZyZXNoZXMgdGhlIGVudGl0eSBhc3NpZ25lZCB0byB0aGUgb2JqZWN0IHBhZ2Vcblx0ICogd2l0aG91dCBuYXZpZ2F0aW9uc1xuXHQgKiBAcmV0dXJucyBSZXNvbHZlZCBvbmNlIHRoZSBkYXRhIGlzIHJlZnJlc2hlZCBvciByZWplY3RlZCBpZiB0aGUgcmVxdWVzdCBmYWlsZWRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cmVmcmVzaCh2UGF0aDogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSB0aGlzLl92aWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRpZiAoIW9CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0Ly8gbm90aGluZyB0byBiZSByZWZyZXNoZWQgLSBkbyBub3QgYmxvY2sgdGhlIGFwcCFcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzLl92aWV3KSxcblx0XHRcdG9TaWRlRWZmZWN0c1NlcnZpY2UgPSBvQXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0b1NpZGVFZmZlY3RzOiBTaWRlRWZmZWN0c1RhcmdldFR5cGUgPSB7XG5cdFx0XHRcdHRhcmdldFByb3BlcnRpZXM6IFtdLFxuXHRcdFx0XHR0YXJnZXRFbnRpdGllczogW11cblx0XHRcdH07XG5cdFx0bGV0IGFQYXRocywgc1BhdGgsIHNCYXNlRW50aXR5U2V0LCBzS2luZDtcblxuXHRcdGlmICh2UGF0aCA9PT0gdW5kZWZpbmVkIHx8IHZQYXRoID09PSBudWxsKSB7XG5cdFx0XHQvLyB3ZSBqdXN0IGFkZCBhbiBlbXB0eSBwYXRoIHdoaWNoIHNob3VsZCByZWZyZXNoIHRoZSBwYWdlIHdpdGggYWxsIGRlcGVuZGVudCBiaW5kaW5nc1xuXHRcdFx0b1NpZGVFZmZlY3RzLnRhcmdldEVudGl0aWVzLnB1c2goe1xuXHRcdFx0XHQkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogXCJcIlxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFQYXRocyA9IEFycmF5LmlzQXJyYXkodlBhdGgpID8gdlBhdGggOiBbdlBhdGhdO1xuXHRcdFx0c0Jhc2VFbnRpdHlTZXQgPSAodGhpcy5fY29udHJvbGxlci5nZXRPd25lckNvbXBvbmVudCgpIGFzIGFueSkuZ2V0RW50aXR5U2V0KCk7XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHNQYXRoID0gYVBhdGhzW2ldO1xuXHRcdFx0XHRpZiAoc1BhdGggPT09IFwiXCIpIHtcblx0XHRcdFx0XHQvLyBhbiBlbXB0eSBwYXRoIHNoYWxsIHJlZnJlc2ggdGhlIGVudGl0eSB3aXRob3V0IGRlcGVuZGVuY2llcyB3aGljaCBtZWFucyAqIGZvciB0aGUgbW9kZWxcblx0XHRcdFx0XHRvU2lkZUVmZmVjdHMudGFyZ2V0UHJvcGVydGllcy5wdXNoKFwiKlwiKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzS2luZCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtzQmFzZUVudGl0eVNldH0vJHtzUGF0aH0vJGtpbmRgKTtcblxuXHRcdFx0XHRcdGlmIChzS2luZCA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0XHRcdFx0b1NpZGVFZmZlY3RzLnRhcmdldEVudGl0aWVzLnB1c2goe1xuXHRcdFx0XHRcdFx0XHQkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogc1BhdGhcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoc0tpbmQpIHtcblx0XHRcdFx0XHRcdG9TaWRlRWZmZWN0cy50YXJnZXRQcm9wZXJ0aWVzLnB1c2goc1BhdGgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoYCR7c1BhdGh9IGlzIG5vdCBhIHZhbGlkIHBhdGggdG8gYmUgcmVmcmVzaGVkYCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhbLi4ub1NpZGVFZmZlY3RzLnRhcmdldEVudGl0aWVzLCAuLi5vU2lkZUVmZmVjdHMudGFyZ2V0UHJvcGVydGllc10sIG9CaW5kaW5nQ29udGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgbGlzdCBlbnRyaWVzIGN1cnJlbnRseSBzZWxlY3RlZCBmb3IgdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNnZXRTZWxlY3RlZENvbnRleHRzXG5cdCAqIEBwYXJhbSBzVGFibGVJZCBUaGUgSUQgaWRlbnRpZnlpbmcgdGhlIHRhYmxlIHRoZSBzZWxlY3RlZCBjb250ZXh0IGlzIHJlcXVlc3RlZCBmb3Jcblx0ICogQHJldHVybnMgQXJyYXkgY29udGFpbmluZyB0aGUgc2VsZWN0ZWQgY29udGV4dHNcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0U2VsZWN0ZWRDb250ZXh0cyhzVGFibGVJZDogc3RyaW5nKSB7XG5cdFx0bGV0IG9UYWJsZSA9IHRoaXMuX3ZpZXcuYnlJZChzVGFibGVJZCk7XG5cdFx0aWYgKG9UYWJsZSAmJiBvVGFibGUuaXNBKFwic2FwLmZlLm1hY3Jvcy50YWJsZS5UYWJsZUFQSVwiKSkge1xuXHRcdFx0b1RhYmxlID0gKG9UYWJsZSBhcyBFbmhhbmNlV2l0aFVJNTxUYWJsZUFQST4pLmdldENvbnRlbnQoKTtcblx0XHR9XG5cdFx0cmV0dXJuIChvVGFibGUgJiYgb1RhYmxlLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikgJiYgKG9UYWJsZSBhcyBhbnkpLmdldFNlbGVjdGVkQ29udGV4dHMoKSkgfHwgW107XG5cdH1cblxuXHQvKipcblx0ICogRGlzcGxheXMgb3IgaGlkZXMgdGhlIHNpZGUgY29udGVudCBvZiBhbiBvYmplY3QgcGFnZS5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5FeHRlbnNpb25BUEkjc2hvd1NpZGVDb250ZW50XG5cdCAqIEBwYXJhbSBzU3ViU2VjdGlvbktleSBLZXkgb2YgdGhlIHNpZGUgY29udGVudCBmcmFnbWVudCBhcyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5qc29uXG5cdCAqIEBwYXJhbSBbYlNob3ddIE9wdGlvbmFsIEJvb2xlYW4gZmxhZyB0byBzaG93IG9yIGhpZGUgdGhlIHNpZGUgY29udGVudFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzaG93U2lkZUNvbnRlbnQoc1N1YlNlY3Rpb25LZXk6IHN0cmluZywgYlNob3c6IGJvb2xlYW4gfCB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBzQmxvY2tJRCA9IGdldFNpZGVDb250ZW50TGF5b3V0SUQoc1N1YlNlY3Rpb25LZXkpLFxuXHRcdFx0b0Jsb2NrID0gdGhpcy5fdmlldy5ieUlkKHNCbG9ja0lEKSxcblx0XHRcdGJCbG9ja1N0YXRlID0gYlNob3cgPT09IHVuZGVmaW5lZCA/ICEob0Jsb2NrIGFzIER5bmFtaWNTaWRlQ29udGVudCkuZ2V0U2hvd1NpZGVDb250ZW50KCkgOiBiU2hvdztcblx0XHQob0Jsb2NrIGFzIER5bmFtaWNTaWRlQ29udGVudCkuc2V0U2hvd1NpZGVDb250ZW50KGJCbG9ja1N0YXRlLCBmYWxzZSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgYm91bmQgY29udGV4dCBvZiB0aGUgY3VycmVudCBvYmplY3QgcGFnZS5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5FeHRlbnNpb25BUEkjZ2V0QmluZGluZ0NvbnRleHRcblx0ICogQHJldHVybnMgQ29udGV4dCBib3VuZCB0byB0aGUgb2JqZWN0IHBhZ2Vcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0QmluZGluZ0NvbnRleHQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZCBhIG1lc3NhZ2UgdG8gYmUgZGlzcGxheWVkIGJlbG93IHRoZSBhbmNob3IgYmFyLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNfYnVpbGRPUE1lc3NhZ2Vcblx0ICogQHBhcmFtIHtzYXAudWkuY29yZS5tZXNzYWdlLk1lc3NhZ2VbXX0gbWVzc2FnZXMgQXJyYXkgb2YgbWVzc2FnZXMgdXNlZCB0byBnZW5lcmF0ZWQgdGhlIG1lc3NhZ2Vcblx0ICogQHJldHVybnMge1Byb21pc2U8TWVzc2FnZT59IFByb21pc2UgY29udGFpbmluZyB0aGUgZ2VuZXJhdGVkIG1lc3NhZ2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFzeW5jIF9idWlsZE9QTWVzc2FnZShtZXNzYWdlczogTWVzc2FnZVtdKTogUHJvbWlzZTxNZXNzYWdlIHwgbnVsbD4ge1xuXHRcdGNvbnN0IHZpZXcgPSB0aGlzLl92aWV3O1xuXHRcdGNvbnN0IHJlc291cmNlQnVuZGxlID0gYXdhaXQgKHZpZXcuZ2V0TW9kZWwoXCJzYXAuZmUuaTE4blwiKSBhcyBSZXNvdXJjZU1vZGVsKS5nZXRSZXNvdXJjZUJ1bmRsZSgpO1xuXHRcdGxldCBtZXNzYWdlOiBNZXNzYWdlIHwgbnVsbCA9IG51bGw7XG5cdFx0c3dpdGNoIChtZXNzYWdlcy5sZW5ndGgpIHtcblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdG1lc3NhZ2UgPSBtZXNzYWdlc1swXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRjb25zdCBtZXNzYWdlU3RhdHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7XG5cdFx0XHRcdFx0RXJyb3I6IHsgaWQ6IDIsIGNvdW50OiAwIH0sXG5cdFx0XHRcdFx0V2FybmluZzogeyBpZDogMSwgY291bnQ6IDAgfSxcblx0XHRcdFx0XHRJbmZvcm1hdGlvbjogeyBpZDogMCwgY291bnQ6IDAgfVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRtZXNzYWdlID0gbWVzc2FnZXMucmVkdWNlKChhY2MsIGN1cnJlbnRWYWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGN1cnJlbnRUeXBlID0gY3VycmVudFZhbHVlLmdldFR5cGUoKTtcblx0XHRcdFx0XHRhY2Muc2V0VHlwZShtZXNzYWdlU3RhdHNbY3VycmVudFR5cGVdLmlkID4gbWVzc2FnZVN0YXRzW2FjYy5nZXRUeXBlKCldLmlkID8gY3VycmVudFR5cGUgOiBhY2MuZ2V0VHlwZSgpKTtcblx0XHRcdFx0XHRtZXNzYWdlU3RhdHNbY3VycmVudFR5cGVdLmNvdW50Kys7XG5cdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0fSwgbmV3IE1lc3NhZ2UoeyB0eXBlOiBNZXNzYWdlVHlwZS5JbmZvcm1hdGlvbiB9KSk7XG5cblx0XHRcdFx0aWYgKG1lc3NhZ2VTdGF0cy5FcnJvci5jb3VudCA9PT0gMCAmJiBtZXNzYWdlU3RhdHMuV2FybmluZy5jb3VudCA9PT0gMCAmJiBtZXNzYWdlU3RhdHMuSW5mb3JtYXRpb24uY291bnQgPiAwKSB7XG5cdFx0XHRcdFx0bWVzc2FnZS5zZXRNZXNzYWdlKHJlc291cmNlQnVuZGxlLmdldFRleHQoXCJPQkpFQ1RQQUdFU1RBVEVfSU5GT1JNQVRJT05cIikpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKChtZXNzYWdlU3RhdHMuRXJyb3IuY291bnQgPiAwICYmIG1lc3NhZ2VTdGF0cy5XYXJuaW5nLmNvdW50ID4gMCkgfHwgbWVzc2FnZVN0YXRzLkluZm9ybWF0aW9uLmNvdW50ID4gMCkge1xuXHRcdFx0XHRcdG1lc3NhZ2Uuc2V0TWVzc2FnZShyZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiT0JKRUNUUEFHRVNUQVRFX0lTU1VFXCIpKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtZXNzYWdlLnNldE1lc3NhZ2UoXG5cdFx0XHRcdFx0XHRyZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFxuXHRcdFx0XHRcdFx0XHRtZXNzYWdlLmdldFR5cGUoKSA9PT0gTWVzc2FnZVR5cGUuRXJyb3IgPyBcIk9CSkVDVFBBR0VTVEFURV9FUlJPUlwiIDogXCJPQkpFQ1RQQUdFU1RBVEVfV0FSTklOR1wiXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbWVzc2FnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNwbGF5cyB0aGUgbWVzc2FnZSBzdHJpcCBiZXR3ZWVuIHRoZSB0aXRsZSBhbmQgdGhlIGhlYWRlciBvZiB0aGUgT2JqZWN0UGFnZS5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5FeHRlbnNpb25BUEkjc2hvd01lc3NhZ2VzXG5cdCAqIEBwYXJhbSB7c2FwLnVpLmNvcmUubWVzc2FnZS5NZXNzYWdlfSBtZXNzYWdlcyBUaGUgbWVzc2FnZSB0byBiZSBkaXNwbGF5ZWRcblx0ICogQHB1YmxpY1xuXHQgKi9cblxuXHRhc3luYyBzaG93TWVzc2FnZXMobWVzc2FnZXM6IE1lc3NhZ2VbXSkge1xuXHRcdGNvbnN0IHZpZXcgPSB0aGlzLl92aWV3O1xuXHRcdGNvbnN0IGludGVybmFsTW9kZWxDb250ZXh0ID0gdmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBtZXNzYWdlID0gYXdhaXQgdGhpcy5fYnVpbGRPUE1lc3NhZ2UobWVzc2FnZXMpO1xuXHRcdFx0aWYgKG1lc3NhZ2UpIHtcblx0XHRcdFx0KGludGVybmFsTW9kZWxDb250ZXh0IGFzIGFueSk/LnNldFByb3BlcnR5KFwiT1BNZXNzYWdlU3RyaXBWaXNpYmlsaXR5XCIsIHRydWUpO1xuXHRcdFx0XHQoaW50ZXJuYWxNb2RlbENvbnRleHQgYXMgYW55KT8uc2V0UHJvcGVydHkoXCJPUE1lc3NhZ2VTdHJpcFRleHRcIiwgbWVzc2FnZS5nZXRNZXNzYWdlKCkpO1xuXHRcdFx0XHQoaW50ZXJuYWxNb2RlbENvbnRleHQgYXMgYW55KT8uc2V0UHJvcGVydHkoXCJPUE1lc3NhZ2VTdHJpcFR5cGVcIiwgbWVzc2FnZS5nZXRUeXBlKCkpO1xuXHRcdFx0XHRJbnZpc2libGVNZXNzYWdlLmdldEluc3RhbmNlKCkuYW5ub3VuY2UobWVzc2FnZS5nZXRNZXNzYWdlKCksIEludmlzaWJsZU1lc3NhZ2VNb2RlLkFzc2VydGl2ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmhpZGVNZXNzYWdlKCk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgZGlzcGxheSBPYmplY3RQYWdlIG1lc3NhZ2VcIik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhpZGVzIHRoZSBtZXNzYWdlIHN0cmlwIGJlbG93IHRoZSBhbmNob3IgYmFyLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNoaWRlTWVzc2FnZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRoaWRlTWVzc2FnZSgpIHtcblx0XHRjb25zdCB2aWV3ID0gdGhpcy5fdmlldztcblx0XHRjb25zdCBpbnRlcm5hbE1vZGVsQ29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHQoaW50ZXJuYWxNb2RlbENvbnRleHQgYXMgYW55KT8uc2V0UHJvcGVydHkoXCJPUE1lc3NhZ2VTdHJpcFZpc2liaWxpdHlcIiwgZmFsc2UpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE9iamVjdFBhZ2VFeHRlbnNpb25BUEk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7O0VBZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVZBLElBWU1BLHNCQUFzQixXQUQzQkMsY0FBYyxDQUFDLDBDQUEwQyxDQUFDO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUUxRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQVRDLE9BVUFDLE9BQU8sR0FBUCxpQkFBUUMsS0FBb0MsRUFBRTtNQUM3QyxNQUFNQyxlQUFlLEdBQUcsSUFBSSxDQUFDQyxLQUFLLENBQUNDLGlCQUFpQixFQUFhO01BQ2pFLElBQUksQ0FBQ0YsZUFBZSxFQUFFO1FBQ3JCO1FBQ0EsT0FBT0csT0FBTyxDQUFDQyxPQUFPLEVBQUU7TUFDekI7TUFDQSxNQUFNQyxhQUFhLEdBQUdDLFdBQVcsQ0FBQ0MsZUFBZSxDQUFDLElBQUksQ0FBQ04sS0FBSyxDQUFDO1FBQzVETyxtQkFBbUIsR0FBR0gsYUFBYSxDQUFDSSxxQkFBcUIsRUFBRTtRQUMzREMsVUFBVSxHQUFHVixlQUFlLENBQUNXLFFBQVEsRUFBRSxDQUFDQyxZQUFZLEVBQUU7UUFDdERDLFlBQW1DLEdBQUc7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