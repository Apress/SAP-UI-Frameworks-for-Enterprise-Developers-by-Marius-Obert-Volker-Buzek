// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/Avatar",
    "sap/m/library",
    "sap/ui/Device",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/ui/shell/ShellHeadItem"
], function (
    Avatar,
    mobileLibrary,
    Device,
    EventHub,
    resources,
    ShellHeadItem
) {
    "use strict";

    // shortcut for sap.m.AvatarSize
    var AvatarSize = mobileLibrary.AvatarSize;

    // List of the dangling controls created for the ShellHeader
    var aCreatedControlIds = [];

    function init (oConfig, oHeaderController, oShellModel) {
        //create only UserActionsMenu, because it is the hero element
        //the other button is created after core-ext-light
        aCreatedControlIds.push(_createUserActionsMenuButton(oShellModel));

    }

    function destroy () {
        aCreatedControlIds.forEach(function (sId) {
            var oControl = sap.ui.getCore().byId(sId);
            if (oControl) {
                if (oControl.destroyContent) {
                    oControl.destroyContent();
                }
                oControl.destroy();
            }
        });
        aCreatedControlIds = [];
    }

    function _createUserActionsMenuButton (oShellModel) {
        var sId = "userActionsMenuHeaderButton",
            oUser = sap.ushell.Container.getUser(),
            sTooltip = resources.i18n.getText("UserActionsMenuToggleButtonAria", oUser.getFullName());

        var oUserActionsMenuAvatar = new Avatar({
            id: sId,
            src: "{/userImage/personPlaceHolder}",
            initials: oUser.getInitials(),
            ariaHasPopup: "Menu",
            displaySize: AvatarSize.XS,
            tooltip: sTooltip,
            press: function () {
                EventHub.emit("showUserActionsMenu", Date.now());
            }
        });
        oUserActionsMenuAvatar.setModel(oShellModel);
        return sId;
    }

    return {
        init: init,
        destroy: destroy
    };
});
