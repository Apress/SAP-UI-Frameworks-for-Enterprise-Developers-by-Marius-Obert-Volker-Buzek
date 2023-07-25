// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/GroupHeaderListItem",
    "sap/m/Text",
    "./CustomGroupHeaderListItemRenderer"
], function (
    GroupHeaderListItem,
    Text,
    CustomGroupHeaderListItemRenderer
) {
    "use strict";

    var CustomGroupHeaderListItem = GroupHeaderListItem.extend("sap.ushell.ui.CustomGroupHeaderListItem", {
        metadata: {
            library: "sap.ushell",
            properties: {
                /**
                 * Defines the description of the group header.
                 */
                description: {type: "string", group: "Data", defaultValue: null}
            },
            aggregations: {
                /**
                 * The hidden aggregation for the title.
                 */
                _titleText: {type: "sap.m.Text", multiple: false, visibility: "hidden"},
                /**
                 * The hidden aggregation for the description.
                 */
                _descriptionText: {type: "sap.m.Text", multiple: false, visibility: "hidden"}
            }
        },

        renderer: CustomGroupHeaderListItemRenderer
    });

    CustomGroupHeaderListItem.prototype.setTitle = function (sTitle) {
        this.setProperty("title", sTitle);

        var oTitleAggregation = this.getAggregation("_titleText");
        if (oTitleAggregation) {
            oTitleAggregation.setText(sTitle);
        } else {
            this.setAggregation("_titleText", new Text({text: sTitle}), true);
        }
    };

    CustomGroupHeaderListItem.prototype.setDescription = function (sDescription) {
        this.setProperty("description", sDescription);

        var oDescriptionAggregation = this.getAggregation("_descriptionText");
        if (oDescriptionAggregation) {
            oDescriptionAggregation.setText(sDescription);
        } else {
            this.setAggregation("_descriptionText", new Text({text: sDescription}), true);
        }
    };

    CustomGroupHeaderListItem.prototype.getContentAnnouncement = function () {
        return this.getTitle() + ", " + this.getDescription();
    };

    CustomGroupHeaderListItem.prototype.setCount = function () {
        return this;
    };

    return CustomGroupHeaderListItem;
});
