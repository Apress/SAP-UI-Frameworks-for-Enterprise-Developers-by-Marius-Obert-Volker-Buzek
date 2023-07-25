/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/extend", "sap/base/util/ObjectPath", "sap/fe/core/helpers/ClassSupport", "sap/m/library", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/core/routing/HashChanger", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel"], function (Log, extend, ObjectPath, ClassSupport, library, Core, Fragment, ControllerExtension, OverrideExecution, HashChanger, XMLPreprocessor, XMLTemplateProcessor, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  let oLastFocusedControl;

  /**
   * A controller extension offering hooks into the routing flow of the application
   *
   * @hideconstructor
   * @public
   * @since 1.86.0
   */
  let ShareUtils = (_dec = defineUI5Class("sap.fe.core.controllerextensions.Share"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = extensible(OverrideExecution.After), _dec8 = publicExtension(), _dec9 = finalExtension(), _dec10 = publicExtension(), _dec11 = finalExtension(), _dec12 = publicExtension(), _dec13 = finalExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(ShareUtils, _ControllerExtension);
    function ShareUtils() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = ShareUtils.prototype;
    _proto.onInit = function onInit() {
      const collaborationInfoModel = new JSONModel({
        url: "",
        appTitle: "",
        subTitle: "",
        minifyUrlForChat: true
      });
      this.base.getView().setModel(collaborationInfoModel, "collaborationInfo");
    };
    _proto.onExit = function onExit() {
      var _this$base, _this$base$getView;
      const collaborationInfoModel = (_this$base = this.base) === null || _this$base === void 0 ? void 0 : (_this$base$getView = _this$base.getView()) === null || _this$base$getView === void 0 ? void 0 : _this$base$getView.getModel("collaborationInfo");
      if (collaborationInfoModel) {
        collaborationInfoModel.destroy();
      }
    }

    /**
     * Opens the share sheet.
     *
     * @function
     * @param oControl The control to which the ActionSheet is opened.
     * @alias sap.fe.core.controllerextensions.Share#openShareSheet
     * @public
     * @since 1.93.0
     */;
    _proto.openShareSheet = function openShareSheet(oControl) {
      this._openShareSheetImpl(oControl);
    }

    /**
     * Adapts the metadata used while sharing the page URL via 'Send Email', 'Share in SAP Jam', and 'Save as Tile'.
     *
     * @function
     * @param oShareMetadata Object containing the share metadata.
     * @param oShareMetadata.url Default URL that will be used via 'Send Email', 'Share in SAP Jam', and 'Save as Tile'
     * @param oShareMetadata.title Default title that will be used as 'email subject' in 'Send Email', 'share text' in 'Share in SAP Jam' and 'title' in 'Save as Tile'
     * @param oShareMetadata.email Email-specific metadata.
     * @param oShareMetadata.email.url URL that will be used specifically for 'Send Email'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.email.title Title that will be used as "email subject" in 'Send Email'. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.jam SAP Jam-specific metadata.
     * @param oShareMetadata.jam.url URL that will be used specifically for 'Share in SAP Jam'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.jam.title Title that will be used as 'share text' in 'Share in SAP Jam'. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.tile Save as Tile-specific metadata.
     * @param oShareMetadata.tile.url URL that will be used specifically for 'Save as Tile'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.tile.title Title to be used for the tile. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.tile.subtitle Subtitle to be used for the tile.
     * @param oShareMetadata.tile.icon Icon to be used for the tile.
     * @param oShareMetadata.tile.queryUrl Query URL of an OData service from which data for a dynamic tile is read.
     * @returns Share Metadata or a Promise resolving the Share Metadata
     * @alias sap.fe.core.controllerextensions.Share#adaptShareMetadata
     * @public
     * @since 1.93.0
     */;
    _proto.adaptShareMetadata = function adaptShareMetadata(oShareMetadata) {
      return oShareMetadata;
    };
    _proto._openShareSheetImpl = async function _openShareSheetImpl(by) {
      let oShareActionSheet;
      const sHash = HashChanger.getInstance().getHash(),
        sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "",
        oShareMetadata = {
          url: window.location.origin + window.location.pathname + window.location.search + (sHash ? sBasePath + sHash : window.location.hash),
          title: document.title,
          email: {
            url: "",
            title: ""
          },
          jam: {
            url: "",
            title: ""
          },
          tile: {
            url: "",
            title: "",
            subtitle: "",
            icon: "",
            queryUrl: ""
          }
        };
      oLastFocusedControl = by;
      const setShareEmailData = function (shareActionSheet, oModelData) {
        const oShareMailModel = shareActionSheet.getModel("shareData");
        const oNewMailData = extend(oShareMailModel.getData(), oModelData);
        oShareMailModel.setData(oNewMailData);
      };
      try {
        const oModelData = await Promise.resolve(this.adaptShareMetadata(oShareMetadata));
        const fragmentController = {
          shareEmailPressed: function () {
            const oMailModel = oShareActionSheet.getModel("shareData");
            const oMailData = oMailModel.getData();
            const oResource = Core.getLibraryResourceBundle("sap.fe.core");
            const sEmailSubject = oMailData.email.title ? oMailData.email.title : oResource.getText("T_SHARE_UTIL_HELPER_SAPFE_EMAIL_SUBJECT", [oMailData.title]);
            library.URLHelper.triggerEmail(undefined, sEmailSubject, oMailData.email.url ? oMailData.email.url : oMailData.url);
          },
          shareMSTeamsPressed: function () {
            const msTeamsModel = oShareActionSheet.getModel("shareData");
            const msTeamsData = msTeamsModel.getData();
            const message = msTeamsData.email.title ? msTeamsData.email.title : msTeamsData.title;
            const url = msTeamsData.email.url ? msTeamsData.email.url : msTeamsData.url;
            const newWindowOpen = window.open("", "ms-teams-share-popup", "width=700,height=600");
            newWindowOpen.opener = null;
            newWindowOpen.location = `https://teams.microsoft.com/share?msgText=${encodeURIComponent(message)}&href=${encodeURIComponent(url)}`;
          },
          onSaveTilePress: function () {
            // TODO it seems that the press event is executed before the dialog is available - adding a timeout is a cheap workaround
            setTimeout(function () {
              var _Core$byId;
              (_Core$byId = Core.byId("bookmarkDialog")) === null || _Core$byId === void 0 ? void 0 : _Core$byId.attachAfterClose(function () {
                oLastFocusedControl.focus();
              });
            }, 0);
          },
          shareJamPressed: () => {
            this._doOpenJamShareDialog(oModelData.jam.title ? oModelData.jam.title : oModelData.title, oModelData.jam.url ? oModelData.jam.url : oModelData.url);
          }
        };
        fragmentController.onCancelPressed = function () {
          oShareActionSheet.close();
        };
        fragmentController.setShareSheet = function (oShareSheet) {
          by.shareSheet = oShareSheet;
        };
        const oThis = new JSONModel({});
        const oPreprocessorSettings = {
          bindingContexts: {
            this: oThis.createBindingContext("/")
          },
          models: {
            this: oThis
          }
        };
        const oTileData = {
          title: oModelData.tile.title ? oModelData.tile.title : oModelData.title,
          subtitle: oModelData.tile.subtitle,
          icon: oModelData.tile.icon,
          url: oModelData.tile.url ? oModelData.tile.url : oModelData.url.substring(oModelData.url.indexOf("#")),
          queryUrl: oModelData.tile.queryUrl
        };
        if (by.shareSheet) {
          oShareActionSheet = by.shareSheet;
          const oShareModel = oShareActionSheet.getModel("share");
          this._setStaticShareData(oShareModel);
          const oNewData = extend(oShareModel.getData(), oTileData);
          oShareModel.setData(oNewData);
          setShareEmailData(oShareActionSheet, oModelData);
          oShareActionSheet.openBy(by);
        } else {
          const sFragmentName = "sap.fe.macros.share.ShareSheet";
          const oPopoverFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
          try {
            const oFragment = await Promise.resolve(XMLPreprocessor.process(oPopoverFragment, {
              name: sFragmentName
            }, oPreprocessorSettings));
            oShareActionSheet = await Fragment.load({
              definition: oFragment,
              controller: fragmentController
            });
            oShareActionSheet.setModel(new JSONModel(oTileData || {}), "share");
            const oShareModel = oShareActionSheet.getModel("share");
            this._setStaticShareData(oShareModel);
            const oNewData = extend(oShareModel.getData(), oTileData);
            oShareModel.setData(oNewData);
            oShareActionSheet.setModel(new JSONModel(oModelData || {}), "shareData");
            setShareEmailData(oShareActionSheet, oModelData);
            by.addDependent(oShareActionSheet);
            oShareActionSheet.openBy(by);
            fragmentController.setShareSheet(oShareActionSheet);
          } catch (oError) {
            Log.error("Error while opening the share fragment", oError);
          }
        }
      } catch (oError) {
        Log.error("Error while fetching the share model data", oError);
      }
    };
    _proto._setStaticShareData = function _setStaticShareData(shareModel) {
      const oResource = Core.getLibraryResourceBundle("sap.fe.core");
      shareModel.setProperty("/jamButtonText", oResource.getText("T_COMMON_SAPFE_SHARE_JAM"));
      shareModel.setProperty("/emailButtonText", oResource.getText("T_SEMANTIC_CONTROL_SEND_EMAIL"));
      shareModel.setProperty("/msTeamsShareButtonText", oResource.getText("T_COMMON_SAPFE_SHARE_MSTEAMS"));
      // Share to Microsoft Teams is feature which for now only gets enabled for selected customers.
      // The switch "sapHorizonEnabled" and check for it was aligned with the Fiori launchpad team.
      if (ObjectPath.get("sap-ushell-config.renderers.fiori2.componentData.config.sapHorizonEnabled") === true) {
        shareModel.setProperty("/msTeamsVisible", true);
      } else {
        shareModel.setProperty("/msTeamsVisible", false);
      }
      const fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
      shareModel.setProperty("/jamVisible", !!fnGetUser && fnGetUser().isJamActive());
      shareModel.setProperty("/saveAsTileVisible", !!(sap && sap.ushell && sap.ushell.Container));
    }

    //the actual opening of the JAM share dialog
    ;
    _proto._doOpenJamShareDialog = function _doOpenJamShareDialog(text, sUrl) {
      const oShareDialog = Core.createComponent({
        name: "sap.collaboration.components.fiori.sharing.dialog",
        settings: {
          object: {
            id: sUrl,
            share: text
          }
        }
      });
      oShareDialog.open();
    }

    /**
     * Triggers the email flow.
     *
     * @returns {void}
     * @private
     */;
    _proto._triggerEmail = async function _triggerEmail() {
      const shareMetadata = await this._adaptShareMetadata();
      const oResource = Core.getLibraryResourceBundle("sap.fe.core");
      const sEmailSubject = shareMetadata.email.title ? shareMetadata.email.title : oResource.getText("T_SHARE_UTIL_HELPER_SAPFE_EMAIL_SUBJECT", [shareMetadata.title]);
      library.URLHelper.triggerEmail(undefined, sEmailSubject, shareMetadata.email.url ? shareMetadata.email.url : shareMetadata.url);
    }

    /**
     * Triggers the share to jam flow.
     *
     * @returns {void}
     * @private
     */;
    _proto._triggerShareToJam = async function _triggerShareToJam() {
      const shareMetadata = await this._adaptShareMetadata();
      this._doOpenJamShareDialog(shareMetadata.jam.title ? shareMetadata.jam.title : shareMetadata.title, shareMetadata.jam.url ? shareMetadata.jam.url : window.location.origin + window.location.pathname + shareMetadata.url);
    }

    /**
     * Triggers the save as tile flow.
     *
     * @param [source]
     * @returns {void}
     * @private
     */;
    _proto._saveAsTile = async function _saveAsTile(source) {
      const shareMetadata = await this._adaptShareMetadata(),
        internalAddBookmarkButton = source.getDependents()[0],
        sHash = HashChanger.getInstance().getHash(),
        sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "";
      shareMetadata.url = sHash ? sBasePath + sHash : window.location.hash;

      // set AddBookmarkButton properties
      internalAddBookmarkButton.setTitle(shareMetadata.tile.title ? shareMetadata.tile.title : shareMetadata.title);
      internalAddBookmarkButton.setSubtitle(shareMetadata.tile.subtitle);
      internalAddBookmarkButton.setTileIcon(shareMetadata.tile.icon);
      internalAddBookmarkButton.setCustomUrl(shareMetadata.tile.url ? shareMetadata.tile.url : shareMetadata.url);
      internalAddBookmarkButton.setServiceUrl(shareMetadata.tile.queryUrl);

      // addBookmarkButton fire press
      internalAddBookmarkButton.firePress();
    }

    /**
     * Call the adaptShareMetadata extension.
     *
     * @returns {object} Share Metadata
     * @private
     */;
    _proto._adaptShareMetadata = function _adaptShareMetadata() {
      const sHash = HashChanger.getInstance().getHash(),
        sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "",
        oShareMetadata = {
          url: window.location.origin + window.location.pathname + window.location.search + (sHash ? sBasePath + sHash : window.location.hash),
          title: document.title,
          email: {
            url: "",
            title: ""
          },
          jam: {
            url: "",
            title: ""
          },
          tile: {
            url: "",
            title: "",
            subtitle: "",
            icon: "",
            queryUrl: ""
          }
        };
      return this.adaptShareMetadata(oShareMetadata);
    };
    return ShareUtils;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "openShareSheet", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "openShareSheet"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptShareMetadata", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptShareMetadata"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_triggerEmail", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "_triggerEmail"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_triggerShareToJam", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "_triggerShareToJam"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_saveAsTile", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "_saveAsTile"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_adaptShareMetadata", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "_adaptShareMetadata"), _class2.prototype)), _class2)) || _class);
  return ShareUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvTGFzdEZvY3VzZWRDb250cm9sIiwiU2hhcmVVdGlscyIsImRlZmluZVVJNUNsYXNzIiwibWV0aG9kT3ZlcnJpZGUiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwib25Jbml0IiwiY29sbGFib3JhdGlvbkluZm9Nb2RlbCIsIkpTT05Nb2RlbCIsInVybCIsImFwcFRpdGxlIiwic3ViVGl0bGUiLCJtaW5pZnlVcmxGb3JDaGF0IiwiYmFzZSIsImdldFZpZXciLCJzZXRNb2RlbCIsIm9uRXhpdCIsImdldE1vZGVsIiwiZGVzdHJveSIsIm9wZW5TaGFyZVNoZWV0Iiwib0NvbnRyb2wiLCJfb3BlblNoYXJlU2hlZXRJbXBsIiwiYWRhcHRTaGFyZU1ldGFkYXRhIiwib1NoYXJlTWV0YWRhdGEiLCJieSIsIm9TaGFyZUFjdGlvblNoZWV0Iiwic0hhc2giLCJIYXNoQ2hhbmdlciIsImdldEluc3RhbmNlIiwiZ2V0SGFzaCIsInNCYXNlUGF0aCIsImhyZWZGb3JBcHBTcGVjaWZpY0hhc2giLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm9yaWdpbiIsInBhdGhuYW1lIiwic2VhcmNoIiwiaGFzaCIsInRpdGxlIiwiZG9jdW1lbnQiLCJlbWFpbCIsImphbSIsInRpbGUiLCJzdWJ0aXRsZSIsImljb24iLCJxdWVyeVVybCIsInNldFNoYXJlRW1haWxEYXRhIiwic2hhcmVBY3Rpb25TaGVldCIsIm9Nb2RlbERhdGEiLCJvU2hhcmVNYWlsTW9kZWwiLCJvTmV3TWFpbERhdGEiLCJleHRlbmQiLCJnZXREYXRhIiwic2V0RGF0YSIsIlByb21pc2UiLCJyZXNvbHZlIiwiZnJhZ21lbnRDb250cm9sbGVyIiwic2hhcmVFbWFpbFByZXNzZWQiLCJvTWFpbE1vZGVsIiwib01haWxEYXRhIiwib1Jlc291cmNlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsInNFbWFpbFN1YmplY3QiLCJnZXRUZXh0IiwibGlicmFyeSIsIlVSTEhlbHBlciIsInRyaWdnZXJFbWFpbCIsInVuZGVmaW5lZCIsInNoYXJlTVNUZWFtc1ByZXNzZWQiLCJtc1RlYW1zTW9kZWwiLCJtc1RlYW1zRGF0YSIsIm1lc3NhZ2UiLCJuZXdXaW5kb3dPcGVuIiwib3BlbiIsIm9wZW5lciIsImVuY29kZVVSSUNvbXBvbmVudCIsIm9uU2F2ZVRpbGVQcmVzcyIsInNldFRpbWVvdXQiLCJieUlkIiwiYXR0YWNoQWZ0ZXJDbG9zZSIsImZvY3VzIiwic2hhcmVKYW1QcmVzc2VkIiwiX2RvT3BlbkphbVNoYXJlRGlhbG9nIiwib25DYW5jZWxQcmVzc2VkIiwiY2xvc2UiLCJzZXRTaGFyZVNoZWV0Iiwib1NoYXJlU2hlZXQiLCJzaGFyZVNoZWV0Iiwib1RoaXMiLCJvUHJlcHJvY2Vzc29yU2V0dGluZ3MiLCJiaW5kaW5nQ29udGV4dHMiLCJ0aGlzIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJtb2RlbHMiLCJvVGlsZURhdGEiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwib1NoYXJlTW9kZWwiLCJfc2V0U3RhdGljU2hhcmVEYXRhIiwib05ld0RhdGEiLCJvcGVuQnkiLCJzRnJhZ21lbnROYW1lIiwib1BvcG92ZXJGcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwib0ZyYWdtZW50IiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsIm5hbWUiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwiY29udHJvbGxlciIsImFkZERlcGVuZGVudCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwic2hhcmVNb2RlbCIsInNldFByb3BlcnR5IiwiT2JqZWN0UGF0aCIsImdldCIsImZuR2V0VXNlciIsImlzSmFtQWN0aXZlIiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwidGV4dCIsInNVcmwiLCJvU2hhcmVEaWFsb2ciLCJjcmVhdGVDb21wb25lbnQiLCJzZXR0aW5ncyIsIm9iamVjdCIsImlkIiwic2hhcmUiLCJfdHJpZ2dlckVtYWlsIiwic2hhcmVNZXRhZGF0YSIsIl9hZGFwdFNoYXJlTWV0YWRhdGEiLCJfdHJpZ2dlclNoYXJlVG9KYW0iLCJfc2F2ZUFzVGlsZSIsInNvdXJjZSIsImludGVybmFsQWRkQm9va21hcmtCdXR0b24iLCJnZXREZXBlbmRlbnRzIiwic2V0VGl0bGUiLCJzZXRTdWJ0aXRsZSIsInNldFRpbGVJY29uIiwic2V0Q3VzdG9tVXJsIiwic2V0U2VydmljZVVybCIsImZpcmVQcmVzcyIsIkNvbnRyb2xsZXJFeHRlbnNpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlNoYXJlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGV4dGVuZCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9leHRlbmRcIjtcbmltcG9ydCBPYmplY3RQYXRoIGZyb20gXCJzYXAvYmFzZS91dGlsL09iamVjdFBhdGhcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBleHRlbnNpYmxlLCBmaW5hbEV4dGVuc2lvbiwgbWV0aG9kT3ZlcnJpZGUsIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgQWN0aW9uU2hlZXQgZnJvbSBcInNhcC9tL0FjdGlvblNoZWV0XCI7XG5pbXBvcnQgdHlwZSBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IGxpYnJhcnkgZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgSGFzaENoYW5nZXIgZnJvbSBcInNhcC91aS9jb3JlL3JvdXRpbmcvSGFzaENoYW5nZXJcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCIuLi9QYWdlQ29udHJvbGxlclwiO1xuXG5sZXQgb0xhc3RGb2N1c2VkQ29udHJvbDogQ29udHJvbDtcblxuLyoqXG4gKiBBIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIG9mZmVyaW5nIGhvb2tzIGludG8gdGhlIHJvdXRpbmcgZmxvdyBvZiB0aGUgYXBwbGljYXRpb25cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS44Ni4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlNoYXJlXCIpXG5jbGFzcyBTaGFyZVV0aWxzIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cblx0QG1ldGhvZE92ZXJyaWRlKClcblx0b25Jbml0KCk6IHZvaWQge1xuXHRcdGNvbnN0IGNvbGxhYm9yYXRpb25JbmZvTW9kZWw6IEpTT05Nb2RlbCA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0dXJsOiBcIlwiLFxuXHRcdFx0YXBwVGl0bGU6IFwiXCIsXG5cdFx0XHRzdWJUaXRsZTogXCJcIixcblx0XHRcdG1pbmlmeVVybEZvckNoYXQ6IHRydWVcblx0XHR9KTtcblx0XHR0aGlzLmJhc2UuZ2V0VmlldygpLnNldE1vZGVsKGNvbGxhYm9yYXRpb25JbmZvTW9kZWwsIFwiY29sbGFib3JhdGlvbkluZm9cIik7XG5cdH1cblxuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRvbkV4aXQoKTogdm9pZCB7XG5cdFx0Y29uc3QgY29sbGFib3JhdGlvbkluZm9Nb2RlbDogSlNPTk1vZGVsID0gdGhpcy5iYXNlPy5nZXRWaWV3KCk/LmdldE1vZGVsKFwiY29sbGFib3JhdGlvbkluZm9cIikgYXMgSlNPTk1vZGVsO1xuXHRcdGlmIChjb2xsYWJvcmF0aW9uSW5mb01vZGVsKSB7XG5cdFx0XHRjb2xsYWJvcmF0aW9uSW5mb01vZGVsLmRlc3Ryb3koKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogT3BlbnMgdGhlIHNoYXJlIHNoZWV0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBjb250cm9sIHRvIHdoaWNoIHRoZSBBY3Rpb25TaGVldCBpcyBvcGVuZWQuXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5TaGFyZSNvcGVuU2hhcmVTaGVldFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkzLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRvcGVuU2hhcmVTaGVldChvQ29udHJvbDogb2JqZWN0KSB7XG5cdFx0dGhpcy5fb3BlblNoYXJlU2hlZXRJbXBsKG9Db250cm9sKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGFwdHMgdGhlIG1ldGFkYXRhIHVzZWQgd2hpbGUgc2hhcmluZyB0aGUgcGFnZSBVUkwgdmlhICdTZW5kIEVtYWlsJywgJ1NoYXJlIGluIFNBUCBKYW0nLCBhbmQgJ1NhdmUgYXMgVGlsZScuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gb1NoYXJlTWV0YWRhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHNoYXJlIG1ldGFkYXRhLlxuXHQgKiBAcGFyYW0gb1NoYXJlTWV0YWRhdGEudXJsIERlZmF1bHQgVVJMIHRoYXQgd2lsbCBiZSB1c2VkIHZpYSAnU2VuZCBFbWFpbCcsICdTaGFyZSBpbiBTQVAgSmFtJywgYW5kICdTYXZlIGFzIFRpbGUnXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS50aXRsZSBEZWZhdWx0IHRpdGxlIHRoYXQgd2lsbCBiZSB1c2VkIGFzICdlbWFpbCBzdWJqZWN0JyBpbiAnU2VuZCBFbWFpbCcsICdzaGFyZSB0ZXh0JyBpbiAnU2hhcmUgaW4gU0FQIEphbScgYW5kICd0aXRsZScgaW4gJ1NhdmUgYXMgVGlsZSdcblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmVtYWlsIEVtYWlsLXNwZWNpZmljIG1ldGFkYXRhLlxuXHQgKiBAcGFyYW0gb1NoYXJlTWV0YWRhdGEuZW1haWwudXJsIFVSTCB0aGF0IHdpbGwgYmUgdXNlZCBzcGVjaWZpY2FsbHkgZm9yICdTZW5kIEVtYWlsJy4gVGhpcyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgb1NoYXJlTWV0YWRhdGEudXJsLlxuXHQgKiBAcGFyYW0gb1NoYXJlTWV0YWRhdGEuZW1haWwudGl0bGUgVGl0bGUgdGhhdCB3aWxsIGJlIHVzZWQgYXMgXCJlbWFpbCBzdWJqZWN0XCIgaW4gJ1NlbmQgRW1haWwnLiBUaGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvU2hhcmVNZXRhZGF0YS50aXRsZS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmphbSBTQVAgSmFtLXNwZWNpZmljIG1ldGFkYXRhLlxuXHQgKiBAcGFyYW0gb1NoYXJlTWV0YWRhdGEuamFtLnVybCBVUkwgdGhhdCB3aWxsIGJlIHVzZWQgc3BlY2lmaWNhbGx5IGZvciAnU2hhcmUgaW4gU0FQIEphbScuIFRoaXMgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIG9TaGFyZU1ldGFkYXRhLnVybC5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmphbS50aXRsZSBUaXRsZSB0aGF0IHdpbGwgYmUgdXNlZCBhcyAnc2hhcmUgdGV4dCcgaW4gJ1NoYXJlIGluIFNBUCBKYW0nLiBUaGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvU2hhcmVNZXRhZGF0YS50aXRsZS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUgU2F2ZSBhcyBUaWxlLXNwZWNpZmljIG1ldGFkYXRhLlxuXHQgKiBAcGFyYW0gb1NoYXJlTWV0YWRhdGEudGlsZS51cmwgVVJMIHRoYXQgd2lsbCBiZSB1c2VkIHNwZWNpZmljYWxseSBmb3IgJ1NhdmUgYXMgVGlsZScuIFRoaXMgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIG9TaGFyZU1ldGFkYXRhLnVybC5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUudGl0bGUgVGl0bGUgdG8gYmUgdXNlZCBmb3IgdGhlIHRpbGUuIFRoaXMgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIG9TaGFyZU1ldGFkYXRhLnRpdGxlLlxuXHQgKiBAcGFyYW0gb1NoYXJlTWV0YWRhdGEudGlsZS5zdWJ0aXRsZSBTdWJ0aXRsZSB0byBiZSB1c2VkIGZvciB0aGUgdGlsZS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUuaWNvbiBJY29uIHRvIGJlIHVzZWQgZm9yIHRoZSB0aWxlLlxuXHQgKiBAcGFyYW0gb1NoYXJlTWV0YWRhdGEudGlsZS5xdWVyeVVybCBRdWVyeSBVUkwgb2YgYW4gT0RhdGEgc2VydmljZSBmcm9tIHdoaWNoIGRhdGEgZm9yIGEgZHluYW1pYyB0aWxlIGlzIHJlYWQuXG5cdCAqIEByZXR1cm5zIFNoYXJlIE1ldGFkYXRhIG9yIGEgUHJvbWlzZSByZXNvbHZpbmcgdGhlIFNoYXJlIE1ldGFkYXRhXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5TaGFyZSNhZGFwdFNoYXJlTWV0YWRhdGFcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45My4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdGFkYXB0U2hhcmVNZXRhZGF0YShvU2hhcmVNZXRhZGF0YToge1xuXHRcdHVybDogc3RyaW5nO1xuXHRcdHRpdGxlOiBzdHJpbmc7XG5cdFx0ZW1haWw/OiB7IHVybDogc3RyaW5nOyB0aXRsZTogc3RyaW5nIH07XG5cdFx0amFtPzogeyB1cmw6IHN0cmluZzsgdGl0bGU6IHN0cmluZyB9O1xuXHRcdHRpbGU/OiB7IHVybDogc3RyaW5nOyB0aXRsZTogc3RyaW5nOyBzdWJ0aXRsZTogc3RyaW5nOyBpY29uOiBzdHJpbmc7IHF1ZXJ5VXJsOiBzdHJpbmcgfTtcblx0fSk6IG9iamVjdCB8IFByb21pc2U8b2JqZWN0PiB7XG5cdFx0cmV0dXJuIG9TaGFyZU1ldGFkYXRhO1xuXHR9XG5cblx0YXN5bmMgX29wZW5TaGFyZVNoZWV0SW1wbChieTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0bGV0IG9TaGFyZUFjdGlvblNoZWV0OiBBY3Rpb25TaGVldDtcblx0XHRjb25zdCBzSGFzaCA9IEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkuZ2V0SGFzaCgpLFxuXHRcdFx0c0Jhc2VQYXRoID0gKEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkgYXMgYW55KS5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoXG5cdFx0XHRcdD8gKEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkgYXMgYW55KS5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoKFwiXCIpXG5cdFx0XHRcdDogXCJcIixcblx0XHRcdG9TaGFyZU1ldGFkYXRhID0ge1xuXHRcdFx0XHR1cmw6XG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLm9yaWdpbiArXG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24uc2VhcmNoICtcblx0XHRcdFx0XHQoc0hhc2ggPyBzQmFzZVBhdGggKyBzSGFzaCA6IHdpbmRvdy5sb2NhdGlvbi5oYXNoKSxcblx0XHRcdFx0dGl0bGU6IGRvY3VtZW50LnRpdGxlLFxuXHRcdFx0XHRlbWFpbDoge1xuXHRcdFx0XHRcdHVybDogXCJcIixcblx0XHRcdFx0XHR0aXRsZTogXCJcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRqYW06IHtcblx0XHRcdFx0XHR1cmw6IFwiXCIsXG5cdFx0XHRcdFx0dGl0bGU6IFwiXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0dGlsZToge1xuXHRcdFx0XHRcdHVybDogXCJcIixcblx0XHRcdFx0XHR0aXRsZTogXCJcIixcblx0XHRcdFx0XHRzdWJ0aXRsZTogXCJcIixcblx0XHRcdFx0XHRpY29uOiBcIlwiLFxuXHRcdFx0XHRcdHF1ZXJ5VXJsOiBcIlwiXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0b0xhc3RGb2N1c2VkQ29udHJvbCA9IGJ5O1xuXG5cdFx0Y29uc3Qgc2V0U2hhcmVFbWFpbERhdGEgPSBmdW5jdGlvbiAoc2hhcmVBY3Rpb25TaGVldDogYW55LCBvTW9kZWxEYXRhOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9TaGFyZU1haWxNb2RlbCA9IHNoYXJlQWN0aW9uU2hlZXQuZ2V0TW9kZWwoXCJzaGFyZURhdGFcIik7XG5cdFx0XHRjb25zdCBvTmV3TWFpbERhdGEgPSBleHRlbmQob1NoYXJlTWFpbE1vZGVsLmdldERhdGEoKSwgb01vZGVsRGF0YSk7XG5cdFx0XHRvU2hhcmVNYWlsTW9kZWwuc2V0RGF0YShvTmV3TWFpbERhdGEpO1xuXHRcdH07XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgb01vZGVsRGF0YTogYW55ID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKHRoaXMuYWRhcHRTaGFyZU1ldGFkYXRhKG9TaGFyZU1ldGFkYXRhKSk7XG5cdFx0XHRjb25zdCBmcmFnbWVudENvbnRyb2xsZXI6IGFueSA9IHtcblx0XHRcdFx0c2hhcmVFbWFpbFByZXNzZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjb25zdCBvTWFpbE1vZGVsID0gb1NoYXJlQWN0aW9uU2hlZXQuZ2V0TW9kZWwoXCJzaGFyZURhdGFcIikgYXMgSlNPTk1vZGVsO1xuXHRcdFx0XHRcdGNvbnN0IG9NYWlsRGF0YSA9IG9NYWlsTW9kZWwuZ2V0RGF0YSgpO1xuXHRcdFx0XHRcdGNvbnN0IG9SZXNvdXJjZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0XHRcdFx0Y29uc3Qgc0VtYWlsU3ViamVjdCA9IG9NYWlsRGF0YS5lbWFpbC50aXRsZVxuXHRcdFx0XHRcdFx0PyBvTWFpbERhdGEuZW1haWwudGl0bGVcblx0XHRcdFx0XHRcdDogb1Jlc291cmNlLmdldFRleHQoXCJUX1NIQVJFX1VUSUxfSEVMUEVSX1NBUEZFX0VNQUlMX1NVQkpFQ1RcIiwgW29NYWlsRGF0YS50aXRsZV0pO1xuXHRcdFx0XHRcdGxpYnJhcnkuVVJMSGVscGVyLnRyaWdnZXJFbWFpbCh1bmRlZmluZWQsIHNFbWFpbFN1YmplY3QsIG9NYWlsRGF0YS5lbWFpbC51cmwgPyBvTWFpbERhdGEuZW1haWwudXJsIDogb01haWxEYXRhLnVybCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNoYXJlTVNUZWFtc1ByZXNzZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjb25zdCBtc1RlYW1zTW9kZWwgPSBvU2hhcmVBY3Rpb25TaGVldC5nZXRNb2RlbChcInNoYXJlRGF0YVwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRcdFx0Y29uc3QgbXNUZWFtc0RhdGEgPSBtc1RlYW1zTW9kZWwuZ2V0RGF0YSgpO1xuXHRcdFx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBtc1RlYW1zRGF0YS5lbWFpbC50aXRsZSA/IG1zVGVhbXNEYXRhLmVtYWlsLnRpdGxlIDogbXNUZWFtc0RhdGEudGl0bGU7XG5cdFx0XHRcdFx0Y29uc3QgdXJsID0gbXNUZWFtc0RhdGEuZW1haWwudXJsID8gbXNUZWFtc0RhdGEuZW1haWwudXJsIDogbXNUZWFtc0RhdGEudXJsO1xuXHRcdFx0XHRcdGNvbnN0IG5ld1dpbmRvd09wZW4gPSB3aW5kb3cub3BlbihcIlwiLCBcIm1zLXRlYW1zLXNoYXJlLXBvcHVwXCIsIFwid2lkdGg9NzAwLGhlaWdodD02MDBcIik7XG5cdFx0XHRcdFx0bmV3V2luZG93T3BlbiEub3BlbmVyID0gbnVsbDtcblx0XHRcdFx0XHRuZXdXaW5kb3dPcGVuIS5sb2NhdGlvbiA9IGBodHRwczovL3RlYW1zLm1pY3Jvc29mdC5jb20vc2hhcmU/bXNnVGV4dD0ke2VuY29kZVVSSUNvbXBvbmVudChcblx0XHRcdFx0XHRcdG1lc3NhZ2Vcblx0XHRcdFx0XHQpfSZocmVmPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHVybCl9YDtcblx0XHRcdFx0fSxcblx0XHRcdFx0b25TYXZlVGlsZVByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gVE9ETyBpdCBzZWVtcyB0aGF0IHRoZSBwcmVzcyBldmVudCBpcyBleGVjdXRlZCBiZWZvcmUgdGhlIGRpYWxvZyBpcyBhdmFpbGFibGUgLSBhZGRpbmcgYSB0aW1lb3V0IGlzIGEgY2hlYXAgd29ya2Fyb3VuZFxuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0KENvcmUuYnlJZChcImJvb2ttYXJrRGlhbG9nXCIpIGFzIERpYWxvZyk/LmF0dGFjaEFmdGVyQ2xvc2UoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRvTGFzdEZvY3VzZWRDb250cm9sLmZvY3VzKCk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0c2hhcmVKYW1QcmVzc2VkOiAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5fZG9PcGVuSmFtU2hhcmVEaWFsb2coXG5cdFx0XHRcdFx0XHRvTW9kZWxEYXRhLmphbS50aXRsZSA/IG9Nb2RlbERhdGEuamFtLnRpdGxlIDogb01vZGVsRGF0YS50aXRsZSxcblx0XHRcdFx0XHRcdG9Nb2RlbERhdGEuamFtLnVybCA/IG9Nb2RlbERhdGEuamFtLnVybCA6IG9Nb2RlbERhdGEudXJsXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0ZnJhZ21lbnRDb250cm9sbGVyLm9uQ2FuY2VsUHJlc3NlZCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0b1NoYXJlQWN0aW9uU2hlZXQuY2xvc2UoKTtcblx0XHRcdH07XG5cblx0XHRcdGZyYWdtZW50Q29udHJvbGxlci5zZXRTaGFyZVNoZWV0ID0gZnVuY3Rpb24gKG9TaGFyZVNoZWV0OiBhbnkpIHtcblx0XHRcdFx0Ynkuc2hhcmVTaGVldCA9IG9TaGFyZVNoZWV0O1xuXHRcdFx0fTtcblxuXHRcdFx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHt9KTtcblx0XHRcdGNvbnN0IG9QcmVwcm9jZXNzb3JTZXR0aW5ncyA9IHtcblx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0dGhpczogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdHRoaXM6IG9UaGlzXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRjb25zdCBvVGlsZURhdGEgPSB7XG5cdFx0XHRcdHRpdGxlOiBvTW9kZWxEYXRhLnRpbGUudGl0bGUgPyBvTW9kZWxEYXRhLnRpbGUudGl0bGUgOiBvTW9kZWxEYXRhLnRpdGxlLFxuXHRcdFx0XHRzdWJ0aXRsZTogb01vZGVsRGF0YS50aWxlLnN1YnRpdGxlLFxuXHRcdFx0XHRpY29uOiBvTW9kZWxEYXRhLnRpbGUuaWNvbixcblx0XHRcdFx0dXJsOiBvTW9kZWxEYXRhLnRpbGUudXJsID8gb01vZGVsRGF0YS50aWxlLnVybCA6IG9Nb2RlbERhdGEudXJsLnN1YnN0cmluZyhvTW9kZWxEYXRhLnVybC5pbmRleE9mKFwiI1wiKSksXG5cdFx0XHRcdHF1ZXJ5VXJsOiBvTW9kZWxEYXRhLnRpbGUucXVlcnlVcmxcblx0XHRcdH07XG5cdFx0XHRpZiAoYnkuc2hhcmVTaGVldCkge1xuXHRcdFx0XHRvU2hhcmVBY3Rpb25TaGVldCA9IGJ5LnNoYXJlU2hlZXQ7XG5cblx0XHRcdFx0Y29uc3Qgb1NoYXJlTW9kZWwgPSBvU2hhcmVBY3Rpb25TaGVldC5nZXRNb2RlbChcInNoYXJlXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdFx0dGhpcy5fc2V0U3RhdGljU2hhcmVEYXRhKG9TaGFyZU1vZGVsKTtcblx0XHRcdFx0Y29uc3Qgb05ld0RhdGEgPSBleHRlbmQob1NoYXJlTW9kZWwuZ2V0RGF0YSgpLCBvVGlsZURhdGEpO1xuXHRcdFx0XHRvU2hhcmVNb2RlbC5zZXREYXRhKG9OZXdEYXRhKTtcblx0XHRcdFx0c2V0U2hhcmVFbWFpbERhdGEob1NoYXJlQWN0aW9uU2hlZXQsIG9Nb2RlbERhdGEpO1xuXHRcdFx0XHRvU2hhcmVBY3Rpb25TaGVldC5vcGVuQnkoYnkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgc0ZyYWdtZW50TmFtZSA9IFwic2FwLmZlLm1hY3Jvcy5zaGFyZS5TaGFyZVNoZWV0XCI7XG5cdFx0XHRcdGNvbnN0IG9Qb3BvdmVyRnJhZ21lbnQgPSBYTUxUZW1wbGF0ZVByb2Nlc3Nvci5sb2FkVGVtcGxhdGUoc0ZyYWdtZW50TmFtZSwgXCJmcmFnbWVudFwiKTtcblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IG9GcmFnbWVudCA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShcblx0XHRcdFx0XHRcdFhNTFByZXByb2Nlc3Nvci5wcm9jZXNzKG9Qb3BvdmVyRnJhZ21lbnQsIHsgbmFtZTogc0ZyYWdtZW50TmFtZSB9LCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRvU2hhcmVBY3Rpb25TaGVldCA9IChhd2FpdCBGcmFnbWVudC5sb2FkKHtcblx0XHRcdFx0XHRcdGRlZmluaXRpb246IG9GcmFnbWVudCxcblx0XHRcdFx0XHRcdGNvbnRyb2xsZXI6IGZyYWdtZW50Q29udHJvbGxlclxuXHRcdFx0XHRcdH0pKSBhcyBhbnk7XG5cblx0XHRcdFx0XHRvU2hhcmVBY3Rpb25TaGVldC5zZXRNb2RlbChuZXcgSlNPTk1vZGVsKG9UaWxlRGF0YSB8fCB7fSksIFwic2hhcmVcIik7XG5cdFx0XHRcdFx0Y29uc3Qgb1NoYXJlTW9kZWwgPSBvU2hhcmVBY3Rpb25TaGVldC5nZXRNb2RlbChcInNoYXJlXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdFx0XHR0aGlzLl9zZXRTdGF0aWNTaGFyZURhdGEob1NoYXJlTW9kZWwpO1xuXHRcdFx0XHRcdGNvbnN0IG9OZXdEYXRhID0gZXh0ZW5kKG9TaGFyZU1vZGVsLmdldERhdGEoKSwgb1RpbGVEYXRhKTtcblx0XHRcdFx0XHRvU2hhcmVNb2RlbC5zZXREYXRhKG9OZXdEYXRhKTtcblxuXHRcdFx0XHRcdG9TaGFyZUFjdGlvblNoZWV0LnNldE1vZGVsKG5ldyBKU09OTW9kZWwob01vZGVsRGF0YSB8fCB7fSksIFwic2hhcmVEYXRhXCIpO1xuXHRcdFx0XHRcdHNldFNoYXJlRW1haWxEYXRhKG9TaGFyZUFjdGlvblNoZWV0LCBvTW9kZWxEYXRhKTtcblxuXHRcdFx0XHRcdGJ5LmFkZERlcGVuZGVudChvU2hhcmVBY3Rpb25TaGVldCk7XG5cdFx0XHRcdFx0b1NoYXJlQWN0aW9uU2hlZXQub3BlbkJ5KGJ5KTtcblx0XHRcdFx0XHRmcmFnbWVudENvbnRyb2xsZXIuc2V0U2hhcmVTaGVldChvU2hhcmVBY3Rpb25TaGVldCk7XG5cdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgb3BlbmluZyB0aGUgc2hhcmUgZnJhZ21lbnRcIiwgb0Vycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBmZXRjaGluZyB0aGUgc2hhcmUgbW9kZWwgZGF0YVwiLCBvRXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdF9zZXRTdGF0aWNTaGFyZURhdGEoc2hhcmVNb2RlbDogYW55KSB7XG5cdFx0Y29uc3Qgb1Jlc291cmNlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL2phbUJ1dHRvblRleHRcIiwgb1Jlc291cmNlLmdldFRleHQoXCJUX0NPTU1PTl9TQVBGRV9TSEFSRV9KQU1cIikpO1xuXHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvZW1haWxCdXR0b25UZXh0XCIsIG9SZXNvdXJjZS5nZXRUZXh0KFwiVF9TRU1BTlRJQ19DT05UUk9MX1NFTkRfRU1BSUxcIikpO1xuXHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvbXNUZWFtc1NoYXJlQnV0dG9uVGV4dFwiLCBvUmVzb3VyY2UuZ2V0VGV4dChcIlRfQ09NTU9OX1NBUEZFX1NIQVJFX01TVEVBTVNcIikpO1xuXHRcdC8vIFNoYXJlIHRvIE1pY3Jvc29mdCBUZWFtcyBpcyBmZWF0dXJlIHdoaWNoIGZvciBub3cgb25seSBnZXRzIGVuYWJsZWQgZm9yIHNlbGVjdGVkIGN1c3RvbWVycy5cblx0XHQvLyBUaGUgc3dpdGNoIFwic2FwSG9yaXpvbkVuYWJsZWRcIiBhbmQgY2hlY2sgZm9yIGl0IHdhcyBhbGlnbmVkIHdpdGggdGhlIEZpb3JpIGxhdW5jaHBhZCB0ZWFtLlxuXHRcdGlmIChPYmplY3RQYXRoLmdldChcInNhcC11c2hlbGwtY29uZmlnLnJlbmRlcmVycy5maW9yaTIuY29tcG9uZW50RGF0YS5jb25maWcuc2FwSG9yaXpvbkVuYWJsZWRcIikgPT09IHRydWUpIHtcblx0XHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvbXNUZWFtc1Zpc2libGVcIiwgdHJ1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvbXNUZWFtc1Zpc2libGVcIiwgZmFsc2UpO1xuXHRcdH1cblx0XHRjb25zdCBmbkdldFVzZXIgPSBPYmplY3RQYXRoLmdldChcInNhcC51c2hlbGwuQ29udGFpbmVyLmdldFVzZXJcIik7XG5cdFx0c2hhcmVNb2RlbC5zZXRQcm9wZXJ0eShcIi9qYW1WaXNpYmxlXCIsICEhZm5HZXRVc2VyICYmIGZuR2V0VXNlcigpLmlzSmFtQWN0aXZlKCkpO1xuXHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvc2F2ZUFzVGlsZVZpc2libGVcIiwgISEoc2FwICYmIHNhcC51c2hlbGwgJiYgc2FwLnVzaGVsbC5Db250YWluZXIpKTtcblx0fVxuXG5cdC8vdGhlIGFjdHVhbCBvcGVuaW5nIG9mIHRoZSBKQU0gc2hhcmUgZGlhbG9nXG5cdF9kb09wZW5KYW1TaGFyZURpYWxvZyh0ZXh0OiBhbnksIHNVcmw/OiBhbnkpIHtcblx0XHRjb25zdCBvU2hhcmVEaWFsb2cgPSBDb3JlLmNyZWF0ZUNvbXBvbmVudCh7XG5cdFx0XHRuYW1lOiBcInNhcC5jb2xsYWJvcmF0aW9uLmNvbXBvbmVudHMuZmlvcmkuc2hhcmluZy5kaWFsb2dcIixcblx0XHRcdHNldHRpbmdzOiB7XG5cdFx0XHRcdG9iamVjdDoge1xuXHRcdFx0XHRcdGlkOiBzVXJsLFxuXHRcdFx0XHRcdHNoYXJlOiB0ZXh0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHQob1NoYXJlRGlhbG9nIGFzIGFueSkub3BlbigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIHRoZSBlbWFpbCBmbG93LlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBfdHJpZ2dlckVtYWlsKCkge1xuXHRcdGNvbnN0IHNoYXJlTWV0YWRhdGE6IGFueSA9IGF3YWl0IHRoaXMuX2FkYXB0U2hhcmVNZXRhZGF0YSgpO1xuXHRcdGNvbnN0IG9SZXNvdXJjZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0Y29uc3Qgc0VtYWlsU3ViamVjdCA9IHNoYXJlTWV0YWRhdGEuZW1haWwudGl0bGVcblx0XHRcdD8gc2hhcmVNZXRhZGF0YS5lbWFpbC50aXRsZVxuXHRcdFx0OiBvUmVzb3VyY2UuZ2V0VGV4dChcIlRfU0hBUkVfVVRJTF9IRUxQRVJfU0FQRkVfRU1BSUxfU1VCSkVDVFwiLCBbc2hhcmVNZXRhZGF0YS50aXRsZV0pO1xuXHRcdGxpYnJhcnkuVVJMSGVscGVyLnRyaWdnZXJFbWFpbCh1bmRlZmluZWQsIHNFbWFpbFN1YmplY3QsIHNoYXJlTWV0YWRhdGEuZW1haWwudXJsID8gc2hhcmVNZXRhZGF0YS5lbWFpbC51cmwgOiBzaGFyZU1ldGFkYXRhLnVybCk7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcnMgdGhlIHNoYXJlIHRvIGphbSBmbG93LlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBfdHJpZ2dlclNoYXJlVG9KYW0oKSB7XG5cdFx0Y29uc3Qgc2hhcmVNZXRhZGF0YTogYW55ID0gYXdhaXQgdGhpcy5fYWRhcHRTaGFyZU1ldGFkYXRhKCk7XG5cdFx0dGhpcy5fZG9PcGVuSmFtU2hhcmVEaWFsb2coXG5cdFx0XHRzaGFyZU1ldGFkYXRhLmphbS50aXRsZSA/IHNoYXJlTWV0YWRhdGEuamFtLnRpdGxlIDogc2hhcmVNZXRhZGF0YS50aXRsZSxcblx0XHRcdHNoYXJlTWV0YWRhdGEuamFtLnVybCA/IHNoYXJlTWV0YWRhdGEuamFtLnVybCA6IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBzaGFyZU1ldGFkYXRhLnVybFxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcnMgdGhlIHNhdmUgYXMgdGlsZSBmbG93LlxuXHQgKlxuXHQgKiBAcGFyYW0gW3NvdXJjZV1cblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgX3NhdmVBc1RpbGUoc291cmNlOiBhbnkpIHtcblx0XHRjb25zdCBzaGFyZU1ldGFkYXRhOiBhbnkgPSBhd2FpdCB0aGlzLl9hZGFwdFNoYXJlTWV0YWRhdGEoKSxcblx0XHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24gPSBzb3VyY2UuZ2V0RGVwZW5kZW50cygpWzBdLFxuXHRcdFx0c0hhc2ggPSBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKSxcblx0XHRcdHNCYXNlUGF0aCA9IChIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpIGFzIGFueSkuaHJlZkZvckFwcFNwZWNpZmljSGFzaFxuXHRcdFx0XHQ/IChIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpIGFzIGFueSkuaHJlZkZvckFwcFNwZWNpZmljSGFzaChcIlwiKVxuXHRcdFx0XHQ6IFwiXCI7XG5cdFx0c2hhcmVNZXRhZGF0YS51cmwgPSBzSGFzaCA/IHNCYXNlUGF0aCArIHNIYXNoIDogd2luZG93LmxvY2F0aW9uLmhhc2g7XG5cblx0XHQvLyBzZXQgQWRkQm9va21hcmtCdXR0b24gcHJvcGVydGllc1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uc2V0VGl0bGUoc2hhcmVNZXRhZGF0YS50aWxlLnRpdGxlID8gc2hhcmVNZXRhZGF0YS50aWxlLnRpdGxlIDogc2hhcmVNZXRhZGF0YS50aXRsZSk7XG5cdFx0aW50ZXJuYWxBZGRCb29rbWFya0J1dHRvbi5zZXRTdWJ0aXRsZShzaGFyZU1ldGFkYXRhLnRpbGUuc3VidGl0bGUpO1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uc2V0VGlsZUljb24oc2hhcmVNZXRhZGF0YS50aWxlLmljb24pO1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uc2V0Q3VzdG9tVXJsKHNoYXJlTWV0YWRhdGEudGlsZS51cmwgPyBzaGFyZU1ldGFkYXRhLnRpbGUudXJsIDogc2hhcmVNZXRhZGF0YS51cmwpO1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uc2V0U2VydmljZVVybChzaGFyZU1ldGFkYXRhLnRpbGUucXVlcnlVcmwpO1xuXG5cdFx0Ly8gYWRkQm9va21hcmtCdXR0b24gZmlyZSBwcmVzc1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uZmlyZVByZXNzKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbCB0aGUgYWRhcHRTaGFyZU1ldGFkYXRhIGV4dGVuc2lvbi5cblx0ICpcblx0ICogQHJldHVybnMge29iamVjdH0gU2hhcmUgTWV0YWRhdGFcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRfYWRhcHRTaGFyZU1ldGFkYXRhKCkge1xuXHRcdGNvbnN0IHNIYXNoID0gSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKS5nZXRIYXNoKCksXG5cdFx0XHRzQmFzZVBhdGggPSAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2hcblx0XHRcdFx0PyAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2goXCJcIilcblx0XHRcdFx0OiBcIlwiLFxuXHRcdFx0b1NoYXJlTWV0YWRhdGEgPSB7XG5cdFx0XHRcdHVybDpcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24ub3JpZ2luICtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgK1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggK1xuXHRcdFx0XHRcdChzSGFzaCA/IHNCYXNlUGF0aCArIHNIYXNoIDogd2luZG93LmxvY2F0aW9uLmhhc2gpLFxuXHRcdFx0XHR0aXRsZTogZG9jdW1lbnQudGl0bGUsXG5cdFx0XHRcdGVtYWlsOiB7XG5cdFx0XHRcdFx0dXJsOiBcIlwiLFxuXHRcdFx0XHRcdHRpdGxlOiBcIlwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGphbToge1xuXHRcdFx0XHRcdHVybDogXCJcIixcblx0XHRcdFx0XHR0aXRsZTogXCJcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0aWxlOiB7XG5cdFx0XHRcdFx0dXJsOiBcIlwiLFxuXHRcdFx0XHRcdHRpdGxlOiBcIlwiLFxuXHRcdFx0XHRcdHN1YnRpdGxlOiBcIlwiLFxuXHRcdFx0XHRcdGljb246IFwiXCIsXG5cdFx0XHRcdFx0cXVlcnlVcmw6IFwiXCJcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRyZXR1cm4gdGhpcy5hZGFwdFNoYXJlTWV0YWRhdGEob1NoYXJlTWV0YWRhdGEpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNoYXJlVXRpbHM7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7RUFrQkEsSUFBSUEsbUJBQTRCOztFQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQU5BLElBUU1DLFVBQVUsV0FEZkMsY0FBYyxDQUFDLHdDQUF3QyxDQUFDLFVBSXZEQyxjQUFjLEVBQUUsVUFXaEJBLGNBQWMsRUFBRSxVQWlCaEJDLGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBNkJoQkQsZUFBZSxFQUFFLFVBQ2pCRSxVQUFVLENBQUNDLGlCQUFpQixDQUFDQyxLQUFLLENBQUMsVUErTG5DSixlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxXQWdCaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBZ0JoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0EyQmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRTtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQXhUakJJLE1BQU0sR0FETixrQkFDZTtNQUNkLE1BQU1DLHNCQUFpQyxHQUFHLElBQUlDLFNBQVMsQ0FBQztR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