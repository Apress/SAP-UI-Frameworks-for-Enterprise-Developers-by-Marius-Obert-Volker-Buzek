// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/*
 * Reads meta tags based on the provided Prefix.
 * Parses each value of a meta tag to an array of object by a given a parse; default is JSON parser.
 */
sap.ui.define(["sap/base/Log"], function (Log) {
    "use strict";

    function fnReadMetaTags (sMetaPrefix, fnParse) {
        var sSelector = "meta[name^='" + sMetaPrefix + "']:not([name=''])";
        var oMetaNodeList = document.querySelectorAll(sSelector);
        var S_COMPONENT = "sap/ushell/bootstrap/common/common.read.metatags";

        var aItems = [];
        fnParse = fnParse || JSON.parse;

        Array.prototype.forEach.call(oMetaNodeList, function (oMetaNode) {
            try {
                aItems.push(fnParse(oMetaNode.content));
            } catch (e) {
                Log.error(e.message, e.stack, S_COMPONENT);
            }
        });

        return aItems;
    }

    return { readMetaTags: fnReadMetaTags };
});
