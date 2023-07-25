// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.footerbar.ContactSupportButton.
sap.ui.define([
    "sap/base/Log",
    "sap/m/ButtonRenderer", // will load the renderer async
    "sap/m/library",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/ushell/ui/launchpad/ActionItem"
], function (
    Log,
    ButtonRenderer,
    mobileLibrary,
    Device,
    jQuery,
    ushellLibrary,
    resources,
    AccessibilityCustomData,
    ActionItem
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    /**
     * Constructor for a new ui/footerbar/ContactSupportButton.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class Add your documentation for the new ui/footerbar/CreateTicketButton
     * @extends sap.ushell.ui.launchpad.ActionItem
     * @constructor
     * @public
     * @name sap.ushell.ui.footerbar.ContactSupportButton
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var ContactSupportButton = ActionItem.extend("sap.ushell.ui.footerbar.ContactSupportButton", /** @lends sap.ushell.ui.footerbar.ContactSupportButton.prototype */ {
        metadata: { library: "sap.ushell" },
        renderer: ButtonRenderer
    });

    /**
     * ContactSupportButton
     *
     * @name sap.ushell.ui.footerbar.ContactSupportButton
     * @private
     * @since 1.16.0
     */
    ContactSupportButton.prototype.init = function () {
        // call the parent sap.ushell.ui.launchpad.ActionItem init method
        if (ActionItem.prototype.init) {
            ActionItem.prototype.init.apply(this, arguments);
        }
        this.setIcon("sap-icon://email");
        this.setText(resources.i18n.getText("contactSupportBtn"));
        this.attachPress(this.showContactSupportDialog);
        this.setEnabled(); // disables button if shell not initialized
    };

    ContactSupportButton.prototype.showContactSupportDialog = function () {
        sap.ui.require([
            "sap/ui/layout/form/SimpleForm",
            "sap/ui/layout/form/SimpleFormLayout",
            "sap/m/TextArea",
            "sap/m/Input",
            "sap/m/Link",
            "sap/m/Label",
            "sap/m/Text",
            "sap/m/Dialog",
            "sap/m/Button",
            "sap/ushell/UserActivityLog"
        ], function (
            SimpleForm,
            SimpleFormLayout,
            TextArea,
            Input,
            Link,
            Label,
            Text,
            Dialog,
            Button,
            UserActivityLog
        ) {
            var applicationType = "",
                url = "",
                additionalInformation = "",
                aBottomFormContent = [],
                originalAfterRenderSimpleForm,
                embedLoginDetailsInBottomForm;

            embedLoginDetailsInBottomForm = function () {
                this.oDialog.removeContent(this.oBottomSimpleForm.getId());
                this.oBottomSimpleForm.destroy();

                if (this.oClientContext.navigationData.applicationInformation) {
                    applicationType = this.oClientContext.navigationData.applicationInformation.applicationType;
                    url = this.oClientContext.navigationData.applicationInformation.url;
                    additionalInformation = this.oClientContext.navigationData.applicationInformation.additionalInformation;
                }
                aBottomFormContent.push(new Text({ text: this.translationBundle.getText("loginDetails") }).addStyleClass("sapUshellContactSupportHeaderInfoText"));
                aBottomFormContent.push(new Label({ text: this.translationBundle.getText("userFld") }));
                aBottomFormContent.push(new Text({ text: this.oClientContext.userDetails.fullName || "" }));
                aBottomFormContent.push(new Label({ text: this.translationBundle.getText("serverFld") }));
                aBottomFormContent.push(new Text({ text: window.location.host }));
                if (this.oClientContext.userDetails.eMail && this.oClientContext.userDetails.eMail !== "") {
                    aBottomFormContent.push(new Label({ text: this.translationBundle.getText("eMailFld") }));
                    aBottomFormContent.push(new Text({ text: this.oClientContext.userDetails.eMail || "" }));
                }
                aBottomFormContent.push(new Label({ text: this.translationBundle.getText("languageFld") }));
                aBottomFormContent.push(new Text({ text: this.oClientContext.userDetails.Language || "" }));

                if (this.oClientContext.shellState === "app" || this.oClientContext.shellState === "standalone") {
                    // Required to align the following Text under the same column.
                    aBottomFormContent.push(new Text({ text: "" }));
                    aBottomFormContent.push(new Text({ text: this.translationBundle.getText("navigationDataFld") }).addStyleClass("sapUshellContactSupportHeaderInfoText"));
                    aBottomFormContent.push(new Label({ text: this.translationBundle.getText("hashFld") }));
                    aBottomFormContent.push(new Text({ text: this.oClientContext.navigationData.navigationHash || "" }));
                    // Required to align the following Text under the same column.
                    aBottomFormContent.push(new Text({ text: "" }));
                    aBottomFormContent.push(new Text({ text: this.translationBundle.getText("applicationInformationFld") }).addStyleClass("sapUshellContactSupportHeaderInfoText"));
                    aBottomFormContent.push(new Label({ text: this.translationBundle.getText("applicationTypeFld") }));
                    aBottomFormContent.push(new Text({ text: applicationType }));
                    aBottomFormContent.push(new Label({ text: this.translationBundle.getText("urlFld") }));
                    aBottomFormContent.push(new Text({ text: url }));
                    aBottomFormContent.push(new Label({ text: this.translationBundle.getText("additionalInfoFld") }));
                    aBottomFormContent.push(new Text({ text: additionalInformation }));
                }
                this.oBottomSimpleForm = new SimpleForm("technicalInfoBox", {
                    layout: SimpleFormLayout.ResponsiveLayout,
                    content: aBottomFormContent
                }).addStyleClass("sapUshellTechnicalInfoBox");
                if (Device.os.ios && Device.system.phone) {
                    this.oBottomSimpleForm.addStyleClass("sapUshellContactSupportFixWidth");
                }

                originalAfterRenderSimpleForm = this.oBottomSimpleForm.onAfterRendering;
                this.oBottomSimpleForm.onAfterRendering = function () {
                    originalAfterRenderSimpleForm.apply(this, arguments);
                    var node = jQuery(this.getDomRef());
                    node.attr("tabIndex", 0);
                    setTimeout(function () {
                        this.focus();
                    }.bind(node), 700);
                };

                this.oDialog.addContent(this.oBottomSimpleForm);
            }.bind(this);

            this._embedLoginDetailsInBottomForm = embedLoginDetailsInBottomForm;

            this.translationBundle = resources.i18n;
            this.oClientContext = UserActivityLog.getMessageInfo();
            this.oLink = new Link({ text: this.translationBundle.getText("technicalDataLink") });
            this.oBottomSimpleForm = new SimpleForm("bottomForm", { editable: false, content: [this.oLink] });
            this.sendButton = new Button("contactSupportSendBtn", {
                text: this.translationBundle.getText("sendBtn"),
                type: ButtonType.Emphasized,
                enabled: true,
                press: function () {
                    this.oSubjectInput.fireChange();
                    this.oTextArea.fireChange();
                    if (this.oSubjectInput.getValueState() !== "Error" && this.oTextArea.getValueState() !== "Error") {
                        sap.ushell.Container.getServiceAsync("SupportTicket").then(function (oSupportTicketService) {
                            var sSubject = this.oSubjectInput.getValue();
                            var sText = this.oTextArea.getValue();
                            oSupportTicketService.createTicket({ subject: sSubject, text: sText, clientContext: this.oClientContext })
                                .done(function () {
                                    sap.ushell.Container.getServiceAsync("Message").then(function (oMessageService) {
                                        oMessageService.info(this.translationBundle.getText("supportTicketCreationSuccess"));
                                    }.bind(this));
                                }.bind(this))
                                .fail(function () {
                                    sap.ushell.Container.getServiceAsync("Message").then(function (oMessageService) {
                                        oMessageService.error(this.translationBundle.getText("supportTicketCreationFailed"));
                                    }.bind(this));
                                }.bind(this));
                            this.oDialog.close();
                        }.bind(this));
                    }
                }.bind(this)
            });
            this.cancelButton = new Button("contactSupportCancelBtn", {
                text: this.translationBundle.getText("cancelBtn"),
                press: function () {
                    this.oDialog.close();
                }.bind(this)
            });

            var onContactInputChange = function (oEvent) {
                var oInput = oEvent.getSource();
                if (!oInput.getValue()) {
                    if (oInput.getId() === "subjectInput") { oInput.setValueStateText(this.translationBundle.getText("subjectEmptyErrorMessage")); }
                    if (oInput.getId() === "textArea") { oInput.setValueStateText(this.translationBundle.getText("txtAreaEmptyErrorMessage")); }
                    oInput.setValueState("Error");
                } else {
                    oInput.setValueState("None");
                }
            }.bind(this);

            this.oSubjectLabel = new Label("subjectLabel", { text: this.translationBundle.getText("subjectLabel"), required: true });
            this.oSubjectInput = new Input("subjectInput", {});
            this.oSubjectInput.attachLiveChange(onContactInputChange);
            this.oSubjectInput.attachChange(onContactInputChange);

            this.oTextAreaLabel = new Label("textAreaLabel", { text: this.translationBundle.getText("txtAreaLabel"), required: true });
            this.oTextArea = new TextArea("textArea", { rows: 7 });
            this.oTextArea.attachLiveChange(onContactInputChange);
            this.oTextArea.attachChange(onContactInputChange);

            this.oTopSimpleForm = new SimpleForm("topForm", {
                editable: false,
                content: [this.oSubjectLabel, this.oSubjectInput, this.oTextAreaLabel, this.oTextArea],
                layout: SimpleFormLayout.ResponsiveGridLayout
            });
            this.oDialog = new Dialog({
                id: "ContactSupportDialog",
                title: this.translationBundle.getText("contactSupportBtn"),
                contentWidth: "29.6rem",
                leftButton: this.sendButton,
                rightButton: this.cancelButton,
                initialFocus: "subjectInput",
                afterOpen: function () {
                    // Fix ios 7.1 bug in ipad4 where there is a gray box on the screen when you close the keyboards
                    jQuery("#textArea").on("focusout", function () {
                        window.scrollTo(0, 0);
                    });
                },
                afterClose: function () {
                    this.oDialog.destroy();
                    if (window.document.activeElement && window.document.activeElement.tagName === "BODY") {
                        window.document.getElementById("userActionsMenuHeaderButton").focus();
                    }
                }.bind(this)
            }).addStyleClass("sapUshellContactSupportDialog").addStyleClass("sapContrastPlus");

            this.oSubjectInput.setPlaceholder(this.translationBundle.getText("subjectPlaceHolderHeader"));
            this.oTextArea.setPlaceholder(this.translationBundle.getText("txtAreaPlaceHolderHeader"));
            this.oLink.attachPress(embedLoginDetailsInBottomForm.bind(this));
            this.oDialog.addCustomData(new AccessibilityCustomData({
                key: "aria-label",
                value: this.translationBundle.getText("ContactSupportArialLabel"),
                writeToDom: true
            }));
            this.oDialog.addContent(this.oTopSimpleForm);
            this.oDialog.addContent(this.oBottomSimpleForm);
            this.oDialog.open();
        }.bind(this));
    };

    ContactSupportButton.prototype.setEnabled = function (bEnabled) {
        if (!sap.ushell.Container) {
            if (this.getEnabled()) {
                Log.warning(
                    "Disabling 'Contact Support' button: unified shell container not initialized",
                    null,
                    "sap.ushell.ui.footerbar.ContactSupportButton"
                );
            }
            bEnabled = false;
        }
        ActionItem.prototype.setEnabled.call(this, bEnabled);
    };

    return ContactSupportButton;
});
