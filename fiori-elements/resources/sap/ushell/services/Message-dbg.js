// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's message service.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/m/MessageBox",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Link",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/FormattedText",
    "sap/m/library",
    "sap/ui/core/library"
], function (
    Log,
    MessageBox,
    Config,
    resources,
    Dialog,
    Text,
    Link,
    Button,
    VBox,
    FormattedText,
    mobileLibrary,
    coreLibrary
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.DialogType
    var DialogType = mobileLibrary.DialogType;

    // shortcut for sap.ui.core.ValueState
    var ValueState = coreLibrary.ValueState;

    // shortcut for sap.m.FlexRendertype
    var FlexRendertype = mobileLibrary.FlexRendertype;

    /**
     * This method MUST be called by the Unified Shell's container only,
     * others MUST call <code>sap.ushell.Container.getServiceAsync("Message")</code>.
     * Constructs a new instance of the page builder service.
     *
     * Message service.
     *
     * @name sap.ushell.services.Message
     * @constructor
     * @class
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.16.0
     * @public
     */
    function Message () {
        var fnShellCallBackFunction;

        /**
         * Initialisation:
         * This method is to be invoked by the Shell to register the message callback function.
         * The signature of the callback is defined via the show function.
         *
         * @param {function} fnShellCallback callback for the shell to execute showing the message
         * @returns {sap.ushell.services.Message} The MessageService
         * @private
         */
        this.init = function (fnShellCallback) {
            fnShellCallBackFunction = fnShellCallback;

            return this;
        };

        /**
         * Shows a message on the screen.
         *
         * @param {sap.ushell.services.Message.Type} iType message type
         * @param {string} sMessage the localized message as plain text
         * @param {object} oParameters Some parameters
         * @private
         */
        this.show = function (iType, sMessage, oParameters) {
            if (!sMessage) {
                Log.error("Message must not be empty.");
                return;
            }

            if (fnShellCallBackFunction && typeof fnShellCallBackFunction === "function") {
                fnShellCallBackFunction(iType, sMessage, oParameters || {});
            } else {
                this.buildMessage(iType, sMessage, oParameters || {});
            }
        };

        /**
         * Decides wether a MessageBox or a SupportMessage needs to be send and accordingly builds a configuration for it.
         *
         * @param {int} iType message type
         * @param {string} sMessage message text
         * @param {object} oParameters message parameters
         * @private
         */
        this.buildMessage = function (iType, sMessage, oParameters) {
            var oMessageBoxConfig = {
                title: oParameters.title,
                actions: oParameters.actions,
                details: oParameters.details,
                onClose: oParameters.callback,
                emphasizedAction: oParameters.emphasizedAction
            },
                sMessageBoxType;

            switch (iType) {
                case Message.Type.ERROR:
                    this._createAndOpenErrorDialog(sMessage, oMessageBoxConfig);
                    return;
                case Message.Type.CONFIRM:
                    if (!oParameters.actions) {
                        sMessageBoxType = "confirm";
                    } else if (oParameters.actions.indexOf("DELETE") > -1) {
                        sMessageBoxType = "warning";
                        oMessageBoxConfig.emphasizedAction = MessageBox.Action.DELETE;
                    } else {
                        oMessageBoxConfig.icon = MessageBox.Icon.QUESTION;
                        sMessageBoxType = "show";
                    }
                    break;
                case Message.Type.INFO:
                    sMessageBoxType = "info";
                    this.buildAndSendMessageToast(sMessage, oParameters.duration || 3000);
                    // Show only Toast. Don't need to show the MessageBox.
                    return;
                default:
                    oMessageBoxConfig = { duration: oParameters.duration || 3000 };
                    sMessageBoxType = "show";
                    break;
            }

            this.sendMessageBox(sMessage, sMessageBoxType, oMessageBoxConfig); // Give me some parameters please!
        };

        /**
         * Copies the content of the dialog to the clipboard.
         *
         * @param {string} message The message displayed by the dialog.
         * @param {object} config The configuration of the dialog.
         * @param {string} dialogTitle The title of the dialog.
         * @private
         */
        this._copyToClipboard = function (message, config, dialogTitle) {
            var sFormattedDetails = config.details;

            if (typeof config.details === "object") {
                // Using stringify() with "tab" as space argument and escaping the JSON to prevent binding
                sFormattedDetails = JSON.stringify(config.details, null, "\t");
            }

            var aCopiedText = [
                "Title: " + (dialogTitle || "-"),
                "Message: " + (message || "-"),
                "Details: " + (sFormattedDetails || "-")
            ];

            var oElementWithPrevFocus = document.activeElement,
                oTemporaryDomElement = document.createElement("textarea"),
                sMessageToastText;

            try {
                oTemporaryDomElement.contentEditable = true;
                oTemporaryDomElement.readonly = false;
                oTemporaryDomElement.innerText = aCopiedText.join("\n");
                document.documentElement.appendChild(oTemporaryDomElement);

                if (navigator.userAgent.match(/ipad|iphone/i)) {
                    var oRange = document.createRange();
                    oRange.selectNodeContents(oTemporaryDomElement);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(oRange);
                    oTemporaryDomElement.setSelectionRange(0, 999999);
                } else {
                    oTemporaryDomElement.select();
                }

                var bSuccessful = document.execCommand("copy");
                sMessageToastText = bSuccessful ? "CopyWasSuccessful" : "CopyWasNotSuccessful";
            } catch (oException) {
                sMessageToastText = "CopyWasNotSuccessful";
            } finally {
                this.buildAndSendMessageToast(resources.i18n.getText(sMessageToastText));
                document.documentElement.removeChild(oTemporaryDomElement);
                window.getSelection().removeAllRanges();
                oElementWithPrevFocus.focus();
            }
        };

        /**
         * Creates a Dialog from a given error message.
         *
         * @param {string} message message text
         * @param {object} messageConfig message configuration (title and details)
         * @private
         */
        this._createAndOpenErrorDialog = function (message, messageConfig) {
            var vDetails = messageConfig.details;
            var oDetailControl;
            if (vDetails) {
                oDetailControl = new FormattedText({
                    htmlText: typeof vDetails === "object" ? vDetails.info : vDetails
                });
            }

            var oErrorDialog = this.errorWithDetails(message, oDetailControl, messageConfig.title);

            // Check that SupportTicket is enabled and verify that we are not in a flow in which Support ticket creation is failing,
            // if this is the case we don't want to show the user the contact support button again
            // Note: Renderer.qunit.js deletes sap.ushell.container before this code is called.
            // check if container is available
            if (sap.ushell.Container
                && Config.last("/core/extension/SupportTicket")
                && message !== resources.i18n.getText("supportTicketCreationFailed")) {
                oErrorDialog.addButton(new Button({
                    text: resources.i18n.getText("contactSupportBtn"),
                    tooltip: resources.i18n.getText("contactSupportBtn_tooltip"),
                    press: function () {
                        sap.ui.require(["sap/ushell/ui/footerbar/ContactSupportButton"],
                            function (ContactSupportButton) {
                                var oContactSupport = new ContactSupportButton();
                                if (oContactSupport) {
                                    oContactSupport.showContactSupportDialog();
                                    // oContactSupport is redundant after creation of the Contact Support Dialog.
                                    oContactSupport.destroy();
                                }
                            });

                        oErrorDialog.close();
                    }
                }));
            }

            if (document.queryCommandSupported("copy")) {
                oErrorDialog.addButton(new Button({
                    text: resources.i18n.getText("CopyToClipboardBtn"),
                    tooltip: resources.i18n.getText("CopyToClipboardBtn_tooltip"),
                    press: this._copyToClipboard.bind(this, message, messageConfig, oErrorDialog.getTitle())
                }));
            }

            oErrorDialog.addButton(new Button({
                text: resources.i18n.getText("closeBtn"),
                type: ButtonType.Emphasized,
                press: oErrorDialog.close.bind(oErrorDialog)
            }));
        };

        /**
         * Sends a MessageToast with provided Message and Duration
         *
         * @param {string} sMessage The message
         * @param {int} iDuration The duration of the MessageToast in ms
         * @private
         */
        this.buildAndSendMessageToast = function (sMessage, iDuration) {
            sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                MessageToast.show(sMessage, { duration: iDuration });
            });
        };

        /**
         * Sends a MessageBox based on the provided configuration
         *
         * @param {string} sMessage The actual error message
         * @param {string} sType The type of the MessageBox. e.g.: show, confirm
         * @param {object} oConfig The configuration of the MessageBox
         * @private
         */
        this.sendMessageBox = function (sMessage, sType, oConfig) {
            if (typeof MessageBox[sType] === "function") {
                MessageBox[sType](sMessage, oConfig);
            } else {
                Log.error("Unknown Message type: " + sType, null, "Message Service");
            }
        };

        /**
         * Shows a MessageToast on the screen.
         *
         * @param {string} sMessage the localized message as plain text
         * @param {int} [iDuration=3000] display duration in ms
         * @since 1.16.0
         * @public
         * @alias sap.ushell.services.Message#info
         */
        this.info = function (sMessage, iDuration) {
            this.show(Message.Type.INFO, sMessage, { duration: iDuration || 3000 });
        };

        /**
         * Shows an error message on the screen.
         *
         * @param {string} sMessage the localized message as plain text
         * @param {string} [sTitle] the localized title as plain text
         * @since 1.16.0
         * @public
         * @alias sap.ushell.services.Message#error
         */
        this.error = function (sMessage, sTitle) {
            Log.error(sMessage);

            this.show(Message.Type.ERROR, sMessage, { title: sTitle });
        };

        /**
         * Shows an confirmation dialog on the screen.
         *
         * The callback is called with the following signature:
         * <code>function(oAction)</code> where oAction is the button that the user has tapped.
         * For example, when the user has pressed the close button, a sap.m.MessageBox.Action.Close is returned.
         *
         * If no actions are provided, OK and Cancel will be shown. In this case oAction is set by one of the following three values:
         *   1. sap.m.MessageBox.Action.OK: OK (confirmed) button is tapped.
         *   2. sap.m.MessageBox.Action.Cancel: Cancel (unconfirmed) button is tapped.
         *   3. null: Confirm dialog is closed by Calling sap.m.InstanceManager.closeAllDialogs()
         *
         * @param {string} sMessage the localized message as plain text
         * @param {function} fnCallback callback function
         * @param {string} [sTitle] the localized title as plain text
         * @param {sap.m.MessageBox.Action|sap.m.MessageBox.Action[]|string|string[]} [vActions]
         *   Either a single action, or an array of two actions.
         *   If no action(s) are given, the single action MessageBox.Action.OK is taken as a default for the parameter.
         *   If more than two actions are given, only the first two actions are taken.
         *   Custom action string(s) can be provided, and then the translation of custom action string(s)
         *   needs to be done by the application.
         * @since 1.16.0
         * @public
         * @alias sap.ushell.services.Message#confirm
         */
        this.confirm = function (sMessage, fnCallback, sTitle, vActions) {
            this.show(Message.Type.CONFIRM, sMessage, { title: sTitle, callback: fnCallback, actions: vActions });
        };

        /**
         * Shows an error message with details on the screen.
         * If more than one control should be shown, an {sap.m.VBox} can be used.
         * The default title is "error".
         * If no custom buttons are given, an emphasized "close" button is shown.
         *
         * @param {string} message The localized message as plain text
         * @param {sap.ui.core.Control} [detailControl] The control that should be displayed,
         * once a user presses the "View Details" link
         * @param {string} [title] The localized title as plain text
         * @param {sap.m.Button[]} [buttons] The custom buttons that should be shown on the dialog
         *
         * @returns {sap.m.Dialog} The error dialog, so it can be destroyed by a custom button
         * @since 1.81.0
         * @protected
         * @alias sap.ushell.services.Message#errorWithDetails
         */
        this.errorWithDetails = function (message, detailControl, title, buttons) {
            if (Array.isArray(detailControl)) {
                buttons = detailControl;
                detailControl = null;
            }

            if (typeof detailControl === "string") {
                buttons = title;
                title = detailControl;
                detailControl = null;
            }

            var oText = new Text({
                text: message,
                visible: !!message
            });

            if (detailControl) {
                oText.addStyleClass("sapUiSmallMarginBottom");
            }
            var oErrorDialog = new Dialog({
                state: ValueState.Error,
                type: DialogType.Message,
                contentWidth: "30rem",
                title: title || resources.i18n.getText("error"),
                content: [
                    new VBox({
                        renderType: FlexRendertype.Bare,
                        items: [
                            oText,
                            new Link({
                                text: resources.i18n.getText("ViewDetails"),
                                visible: !!detailControl,
                                press: function () {
                                    oErrorDialog.getContent()[0].addItem(detailControl);
                                    this.destroy();
                                }
                            })
                        ]
                    })
                ],
                buttons: buttons,
                endButton: new Button({
                    text: resources.i18n.getText("closeBtn"),
                    type: ButtonType.Emphasized,
                    press: function () {
                        oErrorDialog.close();
                    }
                }),
                afterClose: function () {
                    this.destroy();
                }
            }).addStyleClass("sapContrastPlus");
            oErrorDialog.open();

            return oErrorDialog;
        };

        // Expose Type Enum also via Message Service Instance, so that a user does not have to require the ushell lib.
        this.Type = Message.Type;
    }

    /**
     * @name sap.ushell.services.Message.Type
     * @since 1.16.0
     * @private
     */
    Message.Type = {
        INFO: 0,
        ERROR: 1,
        CONFIRM: 2
    };

    Message.hasNoAdapter = true;
    return Message;
});
