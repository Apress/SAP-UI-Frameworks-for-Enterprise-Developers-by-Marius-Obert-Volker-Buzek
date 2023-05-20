// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources"
], function (
    ushellLibrary,
    resources
) {
    "use strict";

    // shortcut for sap.ushell.AppBoxPreviewSize
    var AppBoxPreviewSize = ushellLibrary.AppBoxPreviewSize;

    function getInfos (appBox) {
        return [
            {
                labelKey: "ContentFinder.AppBox.Label.FioriId",
                value: appBox.getAppId()
            },
            {
                labelKey: "ContentFinder.AppBox.Label.Information",
                value: appBox.getInfo()
            }/*, There is no backend property attached to this yet. Therefore, we are hiding it for now.
            {
                labelKey: "ContentFinder.AppBox.Label.SystemId",
                value: appBox.getSystemInfo()
            }*/
        ];
    }

    /**
     * AppBox renderer.
     * @namespace
     */
    var AppBoxRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the appBox, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} appBox AppBox to be rendered.
     */
    AppBoxRenderer.render = function (rm, appBox) {
        rm.openStart("li", appBox);
        rm.class("sapUshellContentFinderAppBox");

        var bDisabled = appBox.getDisabled();
        var bSelected = appBox.getSelected();
        if (bDisabled) {
            rm.class("sapUshellContentFinderAppBoxDisabled");
        } else if (bSelected) {
            rm.class("sapUshellContentFinderAppBoxSelected");
        }

        if (appBox.getSetsize()) {
            rm.attr("aria-posinset", appBox.getPosinset());
            rm.attr("aria-setsize", appBox.getSetsize());
        }

        rm.attr("aria-roledescription", resources.i18n.getText("tile"));
        rm.attr("tabindex", "0");

        var sDataHelpId = appBox.getDataHelpId() || appBox.getAppId();
        if (sDataHelpId) {
            rm.attr("data-help-id", sDataHelpId);
        }

        // calculate height & width
        var bShowPreview = appBox.getShowPreview();
        var iAppBoxHeight = 12.75;
        var iGridGapSize = appBox.getGridGapSize();
        var iHeight = bShowPreview ? iAppBoxHeight * 2 + iGridGapSize : 12.75;
        var aInfos = getInfos(appBox);
        var iExtraInfos = aInfos.length - 3;
        var iExtraHeight = iExtraInfos > 0 ? 1.25 * iExtraInfos : 0;
        if (bShowPreview) {
            iExtraHeight = iExtraHeight * 2;
        }
        rm.style("height", (iHeight + iExtraHeight) + "rem");

        var bLargePreviewSize = appBox.getPreviewSize() === AppBoxPreviewSize.Large;
        var iAppBoxWidth = 19.0625;
        var iWidth = bLargePreviewSize && appBox.getShowPreview() ? iAppBoxWidth * 2 + iGridGapSize : iAppBoxWidth;
        rm.style("width", iWidth + "rem");

        rm.openEnd();

        var sId = appBox.getId();
        var bSelectable = appBox.getSelectable();
        if (bSelectable) {
            rm.openStart("div", sId + "-sidebar");
            rm.class("sapUshellContentFinderAppBoxSideBar");
            rm.openEnd();

            var oCheckbox = appBox.getAggregation("_selectCheckBox");
            oCheckbox.setEnabled(!bDisabled);
            oCheckbox.setSelected(bSelected);
            rm.renderControl(oCheckbox);

            var bLaunchable = appBox.getLaunchUrl();
            if (bLaunchable) {
                // Not implemented yet
                //rm.renderControl(appBox.getAggregation("_launchButton"));
            }
            rm.close("div");
        }

        rm.openStart("div", sId + "-main");
        rm.class("sapUshellContentFinderAppBoxMain");
        rm.openEnd();

        this.renderHeader(rm, appBox, iWidth);

        rm.openStart("ul", sId + "-info");
        rm.class("sapUshellContentFinderAppBoxInfo");
        if (!bShowPreview) {
            rm.class("sapUshellContentFinderAppBoxInfoNoPreview");
        }
        rm.openEnd();

        if (appBox.getShowExtraInformation()) {
            aInfos.forEach(function (oInfo) {
                rm.openStart("li");
                rm.class("sapUshellContentFinderAppBoxInfoLine");
                rm.openEnd();

                rm.openStart("span");
                rm.openEnd();
                rm.text(resources.i18n.getText(oInfo.labelKey));
                rm.close("span");

                rm.openStart("span");
                var iInfoSpanWidth = bSelectable ? iWidth - 10.875 : iWidth - 7.75;
                rm.style("width", iInfoSpanWidth + "rem");
                rm.openEnd();
                rm.text((typeof oInfo.value === "number") || oInfo.value ? oInfo.value : resources.i18n.getText("ContentFinder.AppBox.Text.FieldEmpty"));
                rm.close("span");
                rm.close("li");
            });
        }

        if (bShowPreview) {
            rm.openStart("li");
            rm.class("sapUshellContentFinderAppBoxInfoLine");
            rm.openEnd();

            rm.openStart("span");
            rm.openEnd();
            rm.text(resources.i18n.getText("ContentFinder.AppBox.Label.Preview"));
            rm.close("span");

            rm.close("li");
        }

        rm.close("ul");

        rm.openStart("div", sId + "-preview");
        rm.class("sapUshellContentFinderAppBoxPreview");
        if (bShowPreview) {
            rm.style("height", iAppBoxHeight + "rem");
        }
        rm.openEnd();
        if (bShowPreview) {
            rm.renderControl(appBox.getPreview());
        }
        rm.close("div");

        this.renderFooter(rm, appBox);

        rm.close("div");
        rm.close("li");
    };

    /**
     * Renders the HTML for the appBox header, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} appBox AppBox to be rendered.
     * @param {float} width The width of the appBox in rem.
     */
    AppBoxRenderer.renderHeader = function (rm, appBox, width) {
        var sId = appBox.getId();
        var sIconSource = appBox.getIcon();

        rm.openStart("div", sId + "-header");
        rm.class("sapUshellContentFinderAppBoxHeader");
        if (!sIconSource) {
            rm.class("sapUshellContentFinderAppBoxHeaderNoIcon");
        }
        rm.openEnd();

        if (sIconSource) {
            rm.openStart("div", sId + "-icon");
            rm.class("sapUshellContentFinderAppBoxIcon");
            rm.openEnd();

            var oIcon = appBox.getAggregation("_icon");
            oIcon.setSrc(sIconSource);
            rm.renderControl(oIcon);

            rm.close("div");
        }

        var sTitle = appBox.getTitle();
        var sSubtitle = appBox.getSubtitle();

        if (sTitle || sSubtitle) {
            var iTitleWidth = width - 2; // padding left and right
            if (sIconSource) {
                iTitleWidth -= 1.875;
            }
            if (appBox.getSelectable()) {
                iTitleWidth -= 3.125;
            }

            rm.openStart("div", sId + "-titles");
            rm.openEnd();

            if (sTitle) {
                rm.openStart("div", sId + "-title");
                if (sSubtitle) {
                    rm.class("sapUshellContentFinderAppBoxTitle");
                } else {
                    rm.class("sapUshellContentFinderAppBoxTitleOnly");
                }

                rm.style("width", iTitleWidth + "rem");

                rm.openEnd();
                rm.text(sTitle);
                rm.close("div");
            }

            if (sSubtitle) {
                rm.openStart("div", sId + "-subtitle");
                if (sTitle) {
                    rm.class("sapUshellContentFinderAppBoxSubtitle");
                } else {
                    rm.class("sapUshellContentFinderAppBoxSubtitleOnly");
                }

                rm.style("width", iTitleWidth + "rem");

                rm.openEnd();
                rm.text(sSubtitle);
                rm.close("div");
            }

            rm.close("div");
        }
        rm.close("div");
    };

    /**
     * Renders the HTML for the appBox footer, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} appBox AppBox to be rendered.
     */
    AppBoxRenderer.renderFooter = function (rm, appBox) {
        rm.openStart("div", appBox.getId() + "-footer");
        rm.class("sapUshellContentFinderAppBoxFooter");

        var bLaunchable = appBox.getLaunchUrl();
        var bSelectable = appBox.getSelectable();
        if (!bLaunchable || bSelectable) {
            rm.class("sapUshellContentFinderAppBoxFooterOnlyPreview");
        }
        rm.openEnd();

        if (!bSelectable && bLaunchable) {
            // Not implemented yet
            // rm.renderControl(appBox.getAggregation("_launchButton"));
        }

        if (appBox.getPreview()) {
            var oPreviewButton = appBox.getAggregation("_previewButton");
            if (appBox.getShowPreview()) {
                oPreviewButton.setEnabled(true);
                oPreviewButton.setText(resources.i18n.getText("ContentFinder.AppBox.Button.Close"));
                oPreviewButton.setIcon("sap-icon://navigation-up-arrow");
            } else {
                oPreviewButton.setEnabled(!appBox.getDisablePreview());
                oPreviewButton.setText(resources.i18n.getText("ContentFinder.AppBox.Button.Preview"));
                oPreviewButton.setIcon("sap-icon://navigation-down-arrow");
            }
            rm.renderControl(oPreviewButton);
        }

        rm.close("div");
    };


    return AppBoxRenderer;

}, /* bExport= */ true);
