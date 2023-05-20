// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/core/mvc/View",
    "sap/m/ResponsivePopover",
    "sap/ushell/resources",
    "sap/m/ScrollContainer",
    "sap/ui/Device",
    "sap/m/StandardListItem",
    "sap/m/List",
    "sap/m/Input",
    "sap/m/Button",
    "sap/ui/core/IconPool",
    "sap/m/Bar",
    "sap/m/Label",
    "sap/m/DisplayListItem",
    "sap/m/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    jQuery,
    View,
    ResponsivePopover,
    resources,
    ScrollContainer,
    Device,
    StandardListItem,
    List,
    Input,
    Button,
    IconPool,
    Bar,
    Label,
    DisplayListItem,
    mobileLibrary,
    Filter,
    FilterOperator
) {
    "use strict";

    // shortcut for sap.m.ListMode
    var ListMode = mobileLibrary.ListMode;

    // shortcut for sap.m.ListType
    var ListType = mobileLibrary.ListType;

    return View.extend("sap.ushell.components.appfinder.GroupListPopoverView", {
        getControllerName: function () {
            return "sap.ushell.components.appfinder.GroupListPopover";
        },

        createContent: function (controller) {
            this.oPopover = new ResponsivePopover({
                id: "groupsPopover",
                placement: "Auto",
                title: resources.i18n.getText("addTileToGroups_popoverTitle"),
                contentWidth: "20rem",
                beginButton: this._getCloseButton(),
                content: this._getListContainer(),
                afterClose: [ controller._afterCloseHandler, controller ]
            }).addStyleClass("sapContrastPlus");

            this.addDependent(this.oPopover);
            this.oPopover.setInitialFocus(this._getNewGroupListItem());
        },

        open: function (openByControl) {
            if (document.body.clientHeight - openByControl.getDomRef().getBoundingClientRect().bottom >= 310) {
                this.oPopover.setPlacement("Bottom");
            }

            this.oPopover.openBy(openByControl);
            if (this.getViewData().singleGroupSelection) {
                this.getController()._setFooterVisibility(false);
            }

            this.deferred = jQuery.Deferred();
            return this.deferred.promise();
        },

        _getListContainer: function () {
            if (!this._oListContainer) {
                var oGroupList = this._getGroupList();

                this._oListContainer = new ScrollContainer({
                    id: "popoverContainer",
                    horizontal: false,
                    vertical: true,
                    content: [ oGroupList ],
                    height: Device.system.phone ? "100%" : "190px"
                });
            }

            return this._oListContainer;
        },

        _getNewGroupInput: function () {
            if (!this._oNewGroupNameInput) {
                this._oNewGroupNameInput = new Input("newGroupNameInput", {
                    type: "Text",
                    placeholder: resources.i18n.getText("new_group_name")
                });
            }

            return this._oNewGroupNameInput;
        },

        _getNewGroupHeader: function () {
            if (!this._oNewGroupHeader) {
                var oController = this.getController();

                var oBackButton = new Button({
                    icon: IconPool.getIconURI("nav-back"),
                    press: [ oController._backButtonHandler, oController ],
                    tooltip: resources.i18n.getText("newGroupGoBackBtn_tooltip")
                });
                oBackButton.addStyleClass("sapUshellCatalogNewGroupBackButton");

                this._oNewGroupHeader = new Bar("oHeadBar", {
                    contentLeft: [ oBackButton ],
                    contentMiddle: [
                        new Label({
                            text: resources.i18n.getText("newGroup_popoverTitle")
                        })
                    ]
                });
            }

            return this._oNewGroupHeader;
        },

        _getGroupList: function () {
            if (!this._oGroupList) {
                var oController = this.getController();

                var oListItemTemplate = new DisplayListItem({
                    label: "{oGroup/title}",
                    selected: "{selected}",
                    tooltip: "{oGroup/title}",
                    type: ListType.Active
                });

                var aUserGroupsFilters = [
                    new Filter("oGroup/isGroupLocked", FilterOperator.EQ, false)
                ];

                var oViewData = this.getViewData();
                if (oViewData.enableHideGroups) {
                    aUserGroupsFilters.push(new Filter("oGroup/isGroupVisible", FilterOperator.EQ, true));
                }

                this._oGroupList = new List({
                    mode: oViewData.singleGroupSelection ? ListMode.SingleSelectMaster : ListMode.MultiSelect,
                    items: {
                        path: "/userGroupList",
                        template: oListItemTemplate,
                        filters: aUserGroupsFilters,
                        templateShareable: false
                    },
                    itemPress: [ oController._groupListItemClickHandler, oController ]
                });

                var oNewGroupItem = this._getNewGroupListItem();
                this._oGroupList.addEventDelegate({
                    onBeforeRendering: function () {
                        // Add item to the list so that it is temporarily part of the aggregation and is rendered
                        this._oGroupList.insertAggregation("items", oNewGroupItem, 0, true);
                    }.bind(this),
                    onAfterRendering: function () {
                        // Remove item again so it does not influence aggregation handling
                        this._oGroupList.removeAggregation("items", oNewGroupItem, true);
                    }.bind(this)
                });
            }

            return this._oGroupList;
        },

        /**
         * Creates or retrieves an instance of the "New Group" list item and adds accessibility handling to it.
         *
         * @returns {sap.m.StandardListItem} The "New Group" list item.
         * @private
         */
        _getNewGroupListItem: function () {
            if (!this._oNewGroupItem) {
                // Create "New Group" list item and add it before rendering
                this._oNewGroupItem = new StandardListItem("newGroupItem", {
                    title: resources.i18n.getText("newGroup_listItemText"),
                    type: ListType.Navigation
                });

                this._oNewGroupItem.data("newGroupItem", true);

                // As we remove the item after rendering, it no longer has the list as its parent.
                // Not belonging to a list also means that the sapenter event does not trigger a press event.
                // This is the solution:
                this._oNewGroupItem.getList = function () {
                    return this._oGroupList;
                }.bind(this);

                // Make item non-selectable by hiding its checkbox control
                this._oNewGroupItem.getModeControl = function () {
                    return null;
                };

                // Make item non-selectable also by keyboard
                this._oNewGroupItem.onsapspace = function (event) {
                    event.preventDefault();
                    event.isMarked();
                };

                this._oNewGroupItem.addEventDelegate({
                    onsaptabnext: function (oEvent) {
                        oEvent.preventDefault();
                        oEvent._bIsStopHandlers = true;

                        this._getCloseButton().focus();
                    }
                });
            }

            return this._oNewGroupItem;
        },

        _getCancelButton: function () {
            if (!this._oCancelButton) {
                var oController = this.getController();

                this._oCancelButton = new Button("cancelButton", {
                    press: [ oController._cancelButtonPress, oController ],
                    text: resources.i18n.getText("cancelBtn")
                });
            }
            return this._oCancelButton;
        },

        _getCloseButton: function () {
            if (!this._oCloseButton) {
                var oController = this.getController();

                this._oCloseButton = new Button("closeButton", {
                    press: [ oController._okayCancelButtonPress, oController ],
                    text: resources.i18n.getText("closeBtn")
                });
            }

            return this._oCloseButton;
        }
    });
});
