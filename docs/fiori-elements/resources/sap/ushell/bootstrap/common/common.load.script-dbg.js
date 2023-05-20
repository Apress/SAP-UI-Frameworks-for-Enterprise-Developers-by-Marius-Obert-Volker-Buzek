// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([], function () {
    "use strict";

    /**
     * Load the js script by adding the script tag to the head.
     * The script tag is added with async attribute.
     *
     * @param {String} sFilePath The src attribute for the script.
     * @param {String} [sId] The id attribute for the script. Not set, if not defined.
     * @param {Boolean} [bIsDefer] The defer attribute for the script. Not set, if not defined.
     * @param {Boolean} [bAsync=false] The async attribute for the script.
     *
     * @returns {Promise} Result promise is resolved if script was loaded successfully
     *
     * @private
     */
    function fnLoadScript (sFilePath, sId, bIsDefer, bAsync) {
        return new Promise(function (resolve, reject) {
            function listener (oEvent) {
                oEvent.target.removeEventListener("load", listener);
                oEvent.target.removeEventListener("error", listener);
                if (oEvent.type === "error") {
                    reject();
                }
                resolve();
            }

            var oScriptElement = document.createElement("script");
            oScriptElement.src = sFilePath;
            oScriptElement.async = !!bAsync;
            oScriptElement.addEventListener("load", listener);
            oScriptElement.addEventListener("error", listener);
            if (sId) {
                oScriptElement.id = sId;
            }
            if (bIsDefer) {
                oScriptElement.setAttribute("defer", "");
            }

            document.head.appendChild(oScriptElement);
        });
    }

    return { loadScript: fnLoadScript };
});
