// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @file The FESR Enhancer for AppRuntime
 *
 * @private
 */
sap.ui.define([
    "sap/ui/performance/trace/FESR",
    "sap/ui/performance/trace/Interaction",
    "sap/ushell/utils/type"
], function (
    FESR,
    Interaction,
    oTypeUtils
) {
    "use strict";

    var oFesrEnhancer = {
        _fnOriginalOnBeforeCreated: undefined,
        _currentAppShortId: undefined,

        /**
         * Initializes the enhancer. This includes attaching to sap/ui/performance/trace/FESR#onBeforeCreated and enable ShellAnalytics.
         *
         * @private
         */
        init: function () {
            if (FESR.getActive()) {
                this._fnOriginalOnBeforeCreated = FESR.onBeforeCreated;
                FESR.onBeforeCreated = this._onBeforeCreatedHandler.bind(this);
            }
        },

        /**
         * Hook for {@link sap.ui.performance.trace.FESR#onBeforeCreated} which enhances the "oUi5FesrHandle" with FLP-specific information.
         * The handler will try to detect selected scenarios related to the FLP like open homepage or app to app navigation.
         * All other scenarios are ignored.
         *
         * @private
         */
        _onBeforeCreatedHandler: function (oUi5FesrHandle, oUi5Interaction) {
            if (this._currentAppShortId) {
                oUi5FesrHandle.appNameShort = this._currentAppShortId;
            }

            if (oUi5FesrHandle.interactionType === 1 && (oUi5FesrHandle.stepName === "undetermined_startup" || oUi5FesrHandle.stepName === "undetermined_appruntime_app_startup")) {
                oUi5FesrHandle.stepName = "APPRT@APP_START";
            }

            return oUi5FesrHandle;
        },

        /**
         * Resets the enhancer and detaches form sap/ui/performance/trace/FESR and ushell specific events.
         *
         * @private
         */
        reset: function () {
            if (FESR.getActive()) {
                FESR.onBeforeCreated = this._fnOriginalOnBeforeCreated;
                this.setAppShortId();
            }
        },

        /**
         * Instantiate a new interaction when there is an application start/end via stateful container
         *
         * @private
         */
        startInteraction: function () {
            if (FESR.getActive()) {
                Interaction.start("appruntime_app_startup");
            }
        },

        /**
         * Sets the current app short id
         *
         * @private
         */
        setAppShortId: function (componentHandle) {
            function getValueFromManifest (oMetaData, sPath) {
                var vValue = oMetaData.getManifestEntry(sPath) || [];
                if (!oTypeUtils.isArray(vValue)) {
                    vValue = [vValue];
                }
                return (typeof vValue[0] === "string" ? vValue[0] : undefined);
            }

            if (FESR.getActive()) {
                try {
                    if (componentHandle) {
                        var oComponentData = componentHandle.getInstance().getComponentData().technicalParameters || {},
                            oMetaData = componentHandle.getMetadata();
                        this._currentAppShortId = oComponentData["sap-fiori-id"] || getValueFromManifest(oMetaData, "/sap.fiori/registrationIds");
                    } else {
                        this._currentAppShortId = undefined;
                    }
                } catch (e) {
                    this._currentAppShortId = undefined;
                }
            }
        }
    };

    return oFesrEnhancer;
}, /* bExport= */ true);
