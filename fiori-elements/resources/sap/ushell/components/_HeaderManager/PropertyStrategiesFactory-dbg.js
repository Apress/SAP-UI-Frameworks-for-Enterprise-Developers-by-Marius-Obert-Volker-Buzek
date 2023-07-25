// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "./AddHeadItemsStrategy",
    "./AddHeadEndItemsStrategy",
    "./ExtendApplicationPropertyStrategy",
    "./RemoveItemsStrategy",
    "./SetHeadPropertyStrategy"
], function (
    AddHeadItemsStrategy,
    AddHeadEndItemsStrategy,
    ExtendApplicationPropertyStrategy,
    RemoveItemsStrategy,
    SetHeadPropertyStrategy
) {
    "use strict";

    return function (sPropertyName, sAction) {
        var oStrategy;
        switch (sPropertyName) {
            case "headItems":
                if (sAction === "remove") {
                    oStrategy = RemoveItemsStrategy;
                } else {
                    oStrategy = AddHeadItemsStrategy;
                }
                break;
            case "headEndItems":
                if (sAction === "remove") {
                    oStrategy = RemoveItemsStrategy;
                } else {
                    oStrategy = AddHeadEndItemsStrategy;
                }
                break;
            case "homeUri":
            case "showLogo":
            case "headerVisible":
            case "centralAreaElement":
            case "title":
                oStrategy = SetHeadPropertyStrategy;
                break;
            case "application":
                oStrategy = ExtendApplicationPropertyStrategy;
                break;
            case "application/hierarchy":
            case "application/icon":
            case "application/relatedApps":
            case "application/title":
                oStrategy = SetHeadPropertyStrategy;
                break;
            default:
                oStrategy = null;
                break;
        }
        return oStrategy;
    };

});
