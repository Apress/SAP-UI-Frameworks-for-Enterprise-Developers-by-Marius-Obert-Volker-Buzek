// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/resources",
    "sap/ushell/Config"
], function (resources, Config) {
    "use strict";
    var PagesAndSpaceId = function () {
    };

    /**
     * Gets the url parameters and returns the spaceId and pageId of the target page.
     *
     * @param {string} [sShellHash] Hash part of a shell compliant URL
     * @returns {Promise<object>} Resolves to an object contains the pageId and spaceId
     * @private
     * @since 1.72.0
     */
    PagesAndSpaceId.prototype._getPageAndSpaceId = function (sShellHash) {
        return sap.ushell.Container.getServiceAsync("URLParsing").then(function (urlParsingService) {
            // during boottask the hash gets provided via parameter
            // within the controller it needs to be fetched via the hasher
            if (sShellHash === undefined) {
                sShellHash = window.hasher.getHash();
            }
            var oHash = urlParsingService.parseShellHash(sShellHash) || {};
            var oIntent = {
                semanticObject: oHash.semanticObject || "",
                action: oHash.action || ""
            };
            var oHashPartsParams = oHash.params || {};
            var aPageId = oHashPartsParams.pageId || [];
            var aSpaceId = oHashPartsParams.spaceId || [];

            return this._parsePageAndSpaceId(aPageId, aSpaceId, oIntent);
        }.bind(this));
    };

    /**
     * Parses the given spaceId and pageId. When there are no pageId and spaceId given but the intent is Shell-home,
     * returns the spaceId and pageId of the default page. When there is no pageId and spaceId, only a pageId or a
     * spaceId, or more than one pageId or spaceId given, returns a rejected promise with an error message.
     *
     * @param {array} pageId An array that contains the page id of the page which should be displayed
     * @param {array} spaceId An array that contains the space id of the page which should be displayed
     * @param {object} intent An object that contains the semantic object and action of the page which should be displayed
     * @returns {Promise<object>} Resolves to an object contains the pageId and spaceId
     * @private
     * @since 1.72.0
     */
    PagesAndSpaceId.prototype._parsePageAndSpaceId = function (pageId, spaceId, intent) {
        return new Promise(function (resolve, reject) {
            this.getUserMyHomeEnablement().then(function () {
                if (pageId.length < 1 && spaceId.length < 1) {
                    var bIsShellHome = intent.semanticObject === "Shell" && intent.action === "home";
                    var bIsEmptyIntent = intent.semanticObject === "" && intent.action === "";

                    if (bIsShellHome || bIsEmptyIntent) {
                        this._getUserDefaultSpaceAndPage()
                            .then(function (oResult) {
                                resolve(oResult);
                            })
                            .catch(function (sError) {
                                reject(sError);
                            });
                        return;
                    }
                    reject(resources.i18n.getText("PageRuntime.NoPageIdAndSpaceIdProvided"));
                }

                if (pageId.length === 1 && spaceId.length === 0) {
                    reject(resources.i18n.getText("PageRuntime.OnlyPageIdProvided"));
                }

                if (pageId.length === 0 && spaceId.length === 1) {
                    reject(resources.i18n.getText("PageRuntime.OnlySpaceIdProvided"));
                }

                if (pageId.length > 1 || spaceId.length > 1) {
                    reject(resources.i18n.getText("PageRuntime.MultiplePageOrSpaceIdProvided"));
                }

                if (pageId[0] === "") {
                    reject(resources.i18n.getText("PageRuntime.InvalidPageId"));
                }

                if (spaceId[0] === "") {
                    reject(resources.i18n.getText("PageRuntime.InvalidSpaceId"));
                }

                resolve({
                    pageId: pageId[0],
                    spaceId: spaceId[0]
                });
            }.bind(this));
        }.bind(this));
    };

    /**
     * Returns a promise resolving the User Settings.
     *
     * @returns {Promise<boolean>} Either true, if user has enabled 'MyHome' or false if disabled.
     * @private
     */
    PagesAndSpaceId.prototype.getUserMyHomeEnablement = function () {
        return new Promise(function (resolve, reject) {
            var bUserMyHome = sap.ushell.Container.getUser().getShowMyHome();
            Config.emit("/core/spaces/myHome/userEnabled", bUserMyHome);
            resolve(bUserMyHome);
        });
    };

    /**
     * Returns the default page and the default space of the current user.
     * For its determination the Menu service is used to access the default
     * space: The first page in there is taken as the "default" page.
     *
     * The function also takes into account whether the current user would
     * like to see its My Home page. The config is updated and a notification
     * is published on the config event hub.
     *
     * @returns {Promise<object>} Resolves to an object that contains the pageId and spaceId of the page.
     *   Rejects if no space or page has been assigned to the user, if there's a problem accessing the default space,
     *   or if there was a problem determining whether myHome is enabled for the user.
     * @private
     * @since 1.72.0
     */
    PagesAndSpaceId.prototype._getUserDefaultSpaceAndPage = function () {
        return new Promise(function (resolve, reject) {
            Promise.all([ sap.ushell.Container.getServiceAsync("Menu"), this.getUserMyHomeEnablement()]).then(function (aResults) {
                var oMenuService = aResults[0];

                oMenuService.getDefaultSpace()
                    .then(function (oDefaultSpace) {
                        if (!oDefaultSpace) {
                            reject(resources.i18n.getText("PageRuntime.NoAssignedSpace"));
                            return;
                        }

                        var oDefaultPage = oDefaultSpace && oDefaultSpace.children && oDefaultSpace.children[0];

                        if (!oDefaultPage) {
                            reject(resources.i18n.getText("PageRuntime.NoAssignedPage"));
                            return;
                        }

                        resolve({
                            spaceId: oDefaultSpace.id,
                            pageId: oDefaultPage.id
                        });
                    });
            })
            .catch(function (error) {
                reject(error);
            });
        }.bind(this));
    };

    return new PagesAndSpaceId();
});
