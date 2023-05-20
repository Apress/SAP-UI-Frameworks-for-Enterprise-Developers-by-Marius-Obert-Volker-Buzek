// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * Initialization Code and shared classes of library sap.ushell.ui.shell.ContentRenderer
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/Core"
], function (BaseObject, Core) {
    "use strict";

    var ContentRenderer = BaseObject.extend("sap.ushell.ui.shell.ContentRenderer", {
        constructor: function (oControl, sContentContainerId, oContent, fAfterRenderCallback) {
            BaseObject.apply(this);
            this._id = sContentContainerId;
            this._cntnt = oContent;
            this._ctrl = oControl;
            this._rm = Core.createRenderManager();
            this._cb = fAfterRenderCallback || function () { };
        },

        destroy: function () {
            this._rm.destroy();
            delete this._rm;
            delete this._id;
            delete this._cntnt;
            delete this._cb;
            delete this._ctrl;
            if (this._rerenderTimer) {
                clearTimeout(this._rerenderTimer);
                delete this._rerenderTimer;
            }
            BaseObject.prototype.destroy.apply(this, arguments);
        },

        render: function () {
            if (!this._rm) {
                return;
            }

            if (this._rerenderTimer) {
                clearTimeout(this._rerenderTimer);
            }

            this._rerenderTimer = setTimeout(function () {
                var $content = document.getElementById(this._id);
                var doRender = $content != null;

                if (doRender) {
                    if (typeof (this._cntnt) === "string") {
                        var aContent = this._ctrl.getAggregation(this._cntnt, []);
                        for (var i = 0; i < aContent.length; i++) {
                            this._rm.renderControl(aContent[i]);
                        }
                    } else {
                        this._cntnt(this._rm);
                    }
                    this._rm.flush($content);
                }

                this._cb(doRender);
            }.bind(this), 0);
        }
    });

    return ContentRenderer;
});
