/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides control sap.ui.richtexteditor.ToolbarWrapper.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/Control',
	'./library',
	"sap/m/library",
	'sap/ui/core/IconPool',
	'sap/ui/core/Item',
	'sap/ui/core/Core',
	'sap/ui/richtexteditor/RTESplitButton',
	"sap/base/security/URLListValidator",
	"sap/base/Log",
	"./ToolbarWrapperRenderer" // Control renderer
],
	function(
		jQuery,
		Control,
		library,
		mLibrary,
		IconPool,
		Item,
		Core,
		RTESplitButton,
		URLListValidator,
		Log
	) {
		"use strict";

		var ButtonGroups = library.ButtonGroups,
			EditorCommands = library.EditorCommands,
			ButtonsToCommandsMap = library.ButtonsToCommandsMap,
			ButtonType = mLibrary.ButtonType;

		/**
		 * Constructor for a new RichTextEditor's Custom Toolbar.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The toolbar control is used to replace the default TinyMCE toolbar, with a custom one, built with SAPUI5 controls.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 *
		 * @constructor
		 * @private
		 * @alias sap.ui.richtexteditor.ToolbarWrapper
		 * @since 1.48
		 */
		var ToolbarWrapper = Control.extend("sap.ui.richtexteditor.ToolbarWrapper", /** @lends sap.ui.richtexteditor.ToolbarWrapper.prototype */ {
			metadata: {
				interfaces: [
					"sap.ui.richtexteditor.IToolbar"
				],
				library: "sap.ui.richtexteditor",
				aggregations: {
					/**
					 *  The Custom Toolbar control instance
					 */
					_toolbar: {type: "sap.m.OverflowToolbar", multiple: false, visibility: "hidden"},
					/**
					 * The custom insert image dialog for the Rich Text Editor
					 */
					_customInsertImageDialog: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
					/**
					 * The custom insert link dialog for the Rich Text Editor
					 */
					_customInsertLinkDialog: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
					/**
					 * The custom text color dialog for the Rich Text Editor
					 */
					_customTextColorDialog: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
					/**
					 * The custom background color dialog for the Rich Text Editor
					 */
					_customBackgroundColorDialog: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
					/**
					 * The custom insert table dialog for the Rich Text Editor
					 */
					_customInsertTableDialog: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
				},
				associations: {
					/**
					 * The RichTextEditor control to be linked to the Toolbar control.
					 */
					editor: {type: "sap.ui.richtexteditor.RichTextEditor", multiple: false}
				}
			}
		});

		ToolbarWrapper.prototype.init = function () {
			// This helper is defined within richtexteditor's library.js to provide loose coupling
			// with the controls in sap.m library
			this._helper = library.RichTextEditorHelper;
			this._oResourceBundle = Core.getLibraryResourceBundle("sap.ui.richtexteditor");
			this._oAccessibilityTexts = {};
			this._sTextColor = EditorCommands.TextColor.defaultValue;
			this._sBackgroundColor = EditorCommands.BackgroundColor.defaultValue;
		};

		ToolbarWrapper.prototype.onBeforeRendering = function () {
			if (!this.getAggregation("_toolbar")) {
				var oToolbar = this._createCustomToolbar(),
					oEditor = this.getEditor();

				if (oEditor) {
					oToolbar && oToolbar.setEnabled(oEditor.getEditable());
				}

				oToolbar && oToolbar.addStyleClass("sapUiRTECustomToolbar");
				this.setAggregation("_toolbar", oToolbar);

				this.setAggregation("_customInsertImageDialog",
					this._helper.createDialog(this._createInsertImageConfig("InsertImage")));
				this.setAggregation("_customInsertLinkDialog",
					this._helper.createDialog(this._createInsertLinkConfig("InsertLink")));
				this.setAggregation("_customTextColorDialog",
					this._helper.createColorPalettePopover(this._createColorPalettePopoverConfig("TextColor")));
				this.setAggregation("_customBackgroundColorDialog",
					this._helper.createColorPalettePopover(this._createColorPalettePopoverConfig("BackgroundColor")));
				this.setAggregation("_customInsertTableDialog",
					this._helper.createDialog(this._createInsertTableConfig("InsertTable")));
			}
		};

		ToolbarWrapper.prototype.onAfterRendering = function () {
			var oEditor = this.getEditor();
			// create an array of deep copies with the initial setup of the button groups
			this._initialButtonGroupsState = oEditor && oEditor.getButtonGroups().map(function(oObject){
				 return jQuery.extend(true, {}, oObject);
			});

			this._modifyPopoverOpeningArrowHandlers(true);
			this._syncColors("TextColor", this._sTextColor);
			this._syncColors("BackgroundColor", this._sBackgroundColor);
		};

		ToolbarWrapper.prototype.exit = function () {
			// destroy InvisibleTexts
			for (var sGroupName in this._oAccessibilityTexts) {
				this._destroyAssociatedInvisibleTexts(sGroupName);
			}

			this._customButtons = null;
			this._oAccessibilityTexts = null;
			this._helper = null;
			this._oResourceBundle = null;
			this._sTextColor = null;
			this._sBackgroundColor = null;
		};

		/**
		 * Helper function for attaching / detaching the synchronization handlers of the color selection SplitButton arrow buttons
		 * The arrow button should be displayed as active, while the corresponding color popover is open
		 *
		 * @param {boolean} bAttach Will attach the handlers if true
		 * @private
		 */
		ToolbarWrapper.prototype._modifyPopoverOpeningArrowHandlers = function (bAttach) {
			var oTextColorButton = this._findButtonById("TextColor"),
				oTextColorArrowButton = oTextColorButton && oTextColorButton._getArrowButton(),
				oBackgroundColorButton = this._findButtonById("BackgroundColor"),
				oBackgroundColorArrowButton =  oBackgroundColorButton && oBackgroundColorButton._getArrowButton();

			// Attaching handlers
			// As this method is called each time after rendering, we need to ensure that we attach
			// the necessary handlers only once. That is why two properties were introduced:
			// _bTextColorSyncHandlersAttached
			// _bBackgroundColorSyncHandlersAttached
			if (bAttach && oTextColorArrowButton && !this._bTextColorSyncHandlersAttached) {
				this.getAggregation("_customTextColorDialog")._ensurePopover()
					.attachAfterOpen(oTextColorArrowButton, this._customColorDialogAfterOpen, this)
					.attachAfterClose(oTextColorArrowButton, this._customColorDialogAfterClose, this);
				this._bTextColorSyncHandlersAttached = true;
			}
			if (bAttach && oBackgroundColorArrowButton && !this._bBackgroundColorSyncHandlersAttached) {
				this.getAggregation("_customBackgroundColorDialog")._ensurePopover()
					.attachAfterOpen(oBackgroundColorArrowButton, this._customColorDialogAfterOpen, this)
					.attachAfterClose(oBackgroundColorArrowButton, this._customColorDialogAfterClose, this);
				this._bBackgroundColorSyncHandlersAttached = true;
			}

			// Detaching handlers
			if (!bAttach && oTextColorArrowButton && this._bTextColorSyncHandlersAttached) {
				this.getAggregation("_customTextColorDialog")._ensurePopover()
					.detachAfterOpen(this._customColorDialogAfterOpen, this)
					.detachAfterClose(this._customColorDialogAfterClose, this);
				this._bTextColorSyncHandlersAttached = null;
			}
			if (!bAttach && oBackgroundColorArrowButton && this._bBackgroundColorSyncHandlersAttached) {
				this.getAggregation("_customBackgroundColorDialog")._ensurePopover()
					.detachAfterOpen(this._customColorDialogAfterOpen, this)
					.detachAfterClose(this._customColorDialogAfterClose, this);
				this._bBackgroundColorSyncHandlersAttached = null;
			}
		};

		/**
		 * Synchronization handler called after opening of the text / background color picker dialog
		 *
		 * @param {object} oEvent The event object
		 * @param {object} oButton The color button
		 * @private
		 */
		ToolbarWrapper.prototype._customColorDialogAfterOpen = function (oEvent, oButton) {
			oButton && oButton._activeButton();
		};

		/**
		 * Synchronization handler called after closing of the text / background color picker dialog
		 *
		 * @param {object} oEvent The event object
		 * @param {object} oButton The color button
		 * @private
		 */
		ToolbarWrapper.prototype._customColorDialogAfterClose = function (oEvent, oButton) {
			oButton && oButton._inactiveButton();
		};

		/**
		 * As the toolbar is not direct aggregation of RTE
		 * we should construct a stable ID for the "ancestor" elements.
		 * @param {string} [sExtension] Name of the command / element for which a new ID should be generated
		 * @returns {string} The newly constructed ID
		 *
		 * @private
		 */
		ToolbarWrapper.prototype._getId = function (sExtension) {
			this._getId.counter = this._getId.counter ? this._getId.counter + 1 : 1;

			var sRTEId = this.getEditor() ? this.getEditor().getId() : "_rte" + this._getId.counter,
				sToolbarId = this.getId(),
				aBuilder = [sRTEId + sToolbarId];

			if (sExtension || sExtension === 0) {
				aBuilder.push(sExtension);
			}

			return aBuilder.join("-");
		};

		/**
		 * Gets the RichTextEditor instance
		 *
		 * @returns {(object|null)} Either the editor instance or null
		 */
		ToolbarWrapper.prototype.getEditor = function () {
			var sId = this.getAssociation("editor"),
				oEditor = Core.byId(sId);

			return oEditor || null;
		};

		/**
		 * Helper function for extending the configuration of the TinyMCE for the Custom Toolbar
		 *
		 * @param {object} [oConfig] Configuration object to be extended
		 * @returns {object} The modified configuration object
		 * @public
		 */
		ToolbarWrapper.prototype.modifyRTEToolbarConfig = function (oConfig) {
			var that = this;

			// Remove the native toolbar. From now on the sap.ui.richtexteditor.ToolbarWrapper will be used
			oConfig.toolbar = false;

			oConfig.setup = function (editor) {
				editor.on('PreInit', function () {
					editor.addShortcut('alt+f10', 'Focus the first element in the toolbar.',
						function () {
							var oFirstVisibleElement = that.getAggregation("_toolbar").getAggregation("content").filter(function(oControl) {
								return oControl.getVisible();
							})[0];

							oFirstVisibleElement && oFirstVisibleElement.focus();
						}
					);
                });

				// Sync sap.ui.richtexteditor.ToolbarWrapper buttons with the editor
				editor.on('NodeChange', function () {
					that._syncToolbarStates(this);
				});
			};

			return oConfig;
		};

		/**
		 * Helper function for applying text color or background color to a text node
		 *
		 * @param {string} [sCommand] Command type
		 * @param {string} [sCommandName] Editors command name
		 * @param {string} [sColor] Color parameter
		 * @param {boolean} [bDefaultColor] True if the color param is the default color for the command
		 * @private
		 */
		ToolbarWrapper.prototype._applyColor = function (sCommand, sCommandName, sColor, bDefaultColor) {
			if (bDefaultColor || this._getColor(sCommand).replace(/,\s/g, ',') !== sColor) {
				this.getEditor().getNativeApi().execCommand(sCommandName, false, sColor);
			}
		};

		/**
		 * Helper function for synchronizing the color of the SplitButtons for TextColor and TextBackground
		 *
		 * @param {string} [sCommand] Editors command
		 * @param {string} [sColor] Color parameter
		 * @private
		 */
		ToolbarWrapper.prototype._syncColors = function (sCommand, sColor) {
			var oColorButton = this._findButtonById(sCommand),
				oColorButtonIcon;

			if (!sColor) {
				return;
			}

			if (sCommand === "TextColor") {
				oColorButton && oColorButton.setIconColor(sColor);
			}

			if (sCommand === "BackgroundColor") {
				oColorButtonIcon = oColorButton && oColorButton._getTextButton().getDomRef("img");
				oColorButtonIcon && Core.byId(oColorButtonIcon.id).setColor(sColor);
			}
		};
		/**
		 * Helper function for synchronizing the button states or selected items with the styles applied on the editor
		 * @param {object} [oNativeEditor] Editor Object
		 * @private
		 */
		ToolbarWrapper.prototype._syncToolbarStates = function (oNativeEditor) {
			var oEditorCommand, oControl, sEditorCommand,
				oFormatter = oNativeEditor.formatter,
				oResourceBundle = this._oResourceBundle,
				_syncTextAlign = function (oTextAlignCommand, oEditorFormatter, oControl) {
					var sAlignCommand, sIconUri, oCommand;

					for (sAlignCommand in oTextAlignCommand) {
						oCommand = oEditorCommand[sAlignCommand];
						sIconUri = IconPool.getIconURI(oCommand.icon);
						if (oTextAlignCommand.hasOwnProperty(sAlignCommand) &&
							oEditorFormatter.match(oTextAlignCommand[sAlignCommand].style) &&
							oControl.getIcon() !== sIconUri) {
								oControl.setTooltip(oResourceBundle.getText(oTextAlignCommand.bundleKey) + " " + oResourceBundle.getText(oCommand.bundleKey));
								oControl.setIcon(sIconUri);
								break;
						}
					}
				},
				_syncTextFormatBlock = function (oEditor, oFormatBlockCommand, oControl) {
					var sFormatStyle, sItemId, oFormatStyleObject,
						sFormatBlockCommandValue = oEditor.getDoc().queryCommandValue("FormatBlock");

					// Synchronize the selected item of the Font Family Select with the applied font family style
					for (sFormatStyle in oFormatBlockCommand) {
						if (!oFormatBlockCommand.hasOwnProperty(sFormatStyle)) {
							continue;
						}
						sItemId = oControl.getId() + sFormatStyle;

						/* TODO remove after 1.62 version */
						// the selected item should be changed, only when the new one is different
						// Note: In IE the queryCommandValue function returns the text and in Chrome return the key
						oFormatStyleObject = oFormatBlockCommand[sFormatStyle];

						if ((oControl.getSelectedItemId() !== sItemId) &&
							((sFormatBlockCommandValue === oFormatStyleObject.commandValue) ||
							(sFormatBlockCommandValue === oFormatStyleObject.text ))) {
							oControl.setSelectedItemId(sItemId);
							break;
						}
					}
				},
				_syncTextFontFamily = function (oEditor, oFontFamilyCommand, oControl) {
					var sFontName, sCommandValue, sText, sItemId,
						sFontNameCommandValue = oEditor.getDoc().queryCommandValue("FontName");

					// Synchronize the selected item of the Font Family Select with the applied font family style
					for (sFontName in oFontFamilyCommand) {
						if (!oFontFamilyCommand.hasOwnProperty(sFontName)) {
							continue;
						}
						sItemId = oControl.getId() + sFontName;

						sCommandValue = oFontFamilyCommand[sFontName].commandValue.match(/\w+/g).join("").toLowerCase();
						sFontNameCommandValue = sFontNameCommandValue && sFontNameCommandValue.match(/\w+/g).join("").toLowerCase();
						sText = oFontFamilyCommand[sFontName].text.match(/\w+/g).join("").toLowerCase();

						// the selected item should be changed, only when the new one is different
						if ((oControl.getSelectedItemId() !== sItemId) &&
							(sCommandValue === sFontNameCommandValue || sFontNameCommandValue === sText)) {
							oControl.setSelectedItemId(sItemId);
							break;
						}
					}
				},
				_syncImage = function (oEditor, oControl) {
					var oSelection = oEditor.selection.getNode(),
						bImage = oSelection && oSelection.tagName.toLowerCase() === "img" ||
							(oSelection.parentElement && oSelection.parentElement.tagName.toLowerCase() === "img");

					oControl.setPressed(!!bImage);
				},
				_syncLink = function (oEditor, oControl, bToggleButton) {
					var oSelection = oEditor.selection.getNode(),
						bLink = oSelection && oSelection.tagName.toLowerCase() === "a" ||
							(oSelection.parentElement && oSelection.parentElement.tagName.toLowerCase() === "a");

					if (bToggleButton) {
						oControl.setPressed(!!bLink);
					} else {
						oControl.setEnabled(!!bLink);
					}
				};

			for (sEditorCommand in EditorCommands) {
				if (!EditorCommands.hasOwnProperty(sEditorCommand)) {
					continue;
				}

				oEditorCommand = EditorCommands[sEditorCommand];
				// TODO: Probably there's a better way to handle this
				oControl = Core.byId(this._getId(sEditorCommand));

				if (!oControl) {
					continue;
				}

				switch (sEditorCommand) {
					case "TextAlign":
						_syncTextAlign(oEditorCommand, oFormatter, oControl);
						break;
					case "FontFamily":
						_syncTextFontFamily(oNativeEditor, oEditorCommand, oControl);
						break;
					case "FormatBlock":
						_syncTextFormatBlock(oNativeEditor, oEditorCommand, oControl);
						break;
					case "InsertImage":
						_syncImage(oNativeEditor, oControl);
						break;
					case "InsertLink":
						_syncLink(oNativeEditor, oControl, true);
						break;
					case "Unlink":
						_syncLink(oNativeEditor, oControl, false);
						break;
					case "FontSize":
						// queryCommandValue("FontSize") always returns empty string in FireFox - to be fixed
						// Synchronize the selected item of the Font Name Select with the applied font size style
						var sCommandValue = oNativeEditor.getDoc().queryCommandValue(sEditorCommand),
							sItemId = oControl.getId() + sCommandValue;

						// the selected item should be changed, only when the new one is different
						if (oControl.getSelectedItemId() !== sItemId && sCommandValue) {
							oControl.setSelectedItemId(sItemId);
						}
						break;
					default:
						// Synchronize the pressed state of the OverflowToolbarToggleButtons
						oControl.getMetadata().getName() === "sap.m.OverflowToolbarToggleButton" &&
						oControl.setPressed(oFormatter.match(oEditorCommand.style));
				}
			}
		};

		/**
		 * Helper function for creating Button Control configuration
		 *
		 * @param {string} [sCommand] Editor Command
		 * @returns {object} The editor command configuration object
		 * @private
		 */
		ToolbarWrapper.prototype._createButtonConfig = function (sCommand) {
			var oCommand = EditorCommands[sCommand],
				oRTE = this.getEditor();

			return {
				id: this._getId(sCommand),
				icon: IconPool.getIconURI(oCommand.icon),
				tooltip: this._oResourceBundle.getText(oCommand.bundleKey),
				text: this._oResourceBundle.getText(oCommand.bundleKey),
				press: function () {
					if (oRTE) {
						oRTE.getNativeApi().execCommand(oCommand.command);
					} else {
						Log.warning("Cannot execute native command: " + oCommand.command);
					}
				}
			};
		};

		/**
		 * Helper function for creating MenuButtonItem Controls
		 *
		 * @param {string} [sCommand] Editor Command
		 * @returns {Array} An array of menu items which should be included in the menu of the MenuButton
		 * @private
		 */
		ToolbarWrapper.prototype._createMenuButtonItems = function (sCommand) {
			var oEditorHelper = this._helper,
				aItems = [],
				sItemText,
				oCommand;

			for (var sEditorCommand in EditorCommands[sCommand]) {
				if (sEditorCommand === 'bundleKey') {
					continue;
				}

				oCommand = EditorCommands[sCommand][sEditorCommand];
				sItemText = this._oResourceBundle.getText(oCommand.bundleKey) || oCommand.text;
				aItems.push(oEditorHelper.createMenuItem(this._getId(sCommand + sEditorCommand), sItemText, IconPool.getIconURI(oCommand.icon)));
			}

			return aItems;
		};

		/**
		 * Helper function for finding the correct Text Align command
		 *
		 * @param {string} [sIconUri] The selected menu item icon
		 * @returns {string} The found command
		 * @private
		 */
		ToolbarWrapper.prototype._findTextAlignCommandByIcon = function (sIconUri) {
			var oEditorCommands = EditorCommands['TextAlign'],
				sCommandIconUri, sCommand;

			Object.keys(oEditorCommands)
				.forEach(function(key) {
					sCommandIconUri = IconPool.getIconURI(oEditorCommands[key].icon);
					if (key !== 'bundleKey' && sCommandIconUri === sIconUri) {
						sCommand = key;
					}
				});

			return sCommand;

		};

		/**
		 * Helper function for creating SelectItem Controls for FontStyle Select
		 *
		 * @returns {Array} An array of items for the font style select control
		 * @private
		 */
		ToolbarWrapper.prototype._createFontStyleSelectItems = function () {
			var oFontFamilies = EditorCommands["FontFamily"],
				aItems = [],
				oItem;

			for (var sFontStyle in oFontFamilies) {
				oItem = {
					id: this._getId("FontFamily" + sFontStyle),
					text: oFontFamilies[sFontStyle].text
				};

				aItems.push(new Item(oItem));
			}

			return aItems;
		};

		/**
		 * Helper function for finding the command value of a given font style command
		 *
		 * @param {string} [sItemText] Font Family
		 * @returns {string} The command value of the given font style
		 * @private
		 */
		ToolbarWrapper.prototype._getFontStyleCommand = function (sItemText) {
			var oFontFamilies = EditorCommands["FontFamily"];

			for (var sFontStyle in oFontFamilies) {
				if (oFontFamilies.hasOwnProperty(sFontStyle) && oFontFamilies[sFontStyle].text === sItemText) {
					return oFontFamilies[sFontStyle].commandValue;
				}
			}
		};

		/**
		 * Helper function for finding the command value of a given format command
		 *
		 * @param {string} [sItemText] Text Item
		 * @returns {string} The command value of the given format
		 * @private
		 */
		ToolbarWrapper.prototype._getFormatBlockCommand = function (sItemText) {
			var oFormat = EditorCommands["FormatBlock"];

			for (var sFormat in oFormat) {
				if (oFormat.hasOwnProperty(sFormat) && this._oResourceBundle.getText(oFormat[sFormat].bundleKey) === sItemText) {
					return oFormat[sFormat].commandValue;
				}
			}
		};

		/**
		 * Helper function for creating SelectItem Controls for FontSize Select
		 *
		 * @returns {Array} An array of items for the font size select control
		 * @private
		 */
		ToolbarWrapper.prototype._createFontSizeSelectItems = function () {
			var aItems = [],
				number = 1, //TinyMCE command values for font sizes have a value from 1 to 7
				oItem;

			EditorCommands["FontSize"].forEach(function (item) {
				oItem = {
					id: this._getId("FontSize" + number),
					text: item + " pt"
				};
				aItems.push(new Item(oItem));
				number++;
			}, this);
			return aItems;
		};

		/**
		 * Helper function for creating SelectItem controls for FontSize select
		 *
		 * @returns {Array} An array of items for the font size select control
		 * @private
		 */
		ToolbarWrapper.prototype._createFormatBlockItems = function () {
			var oFormatBlock = EditorCommands["FormatBlock"],
				aItems = [],
				oItem;

			for (var sFormatStyle in oFormatBlock) {
				oItem = {
					id: this._getId("FormatBlock" + sFormatStyle),
					text: this._oResourceBundle.getText(oFormatBlock[sFormatStyle].bundleKey)
				};

				aItems.push(new Item(oItem));
			}

			return aItems;
		};

		/**
		 * Helper function for getting the color style applied to a current node or at a certain caret position
		 *
		 * @param {string} [sCommand] The Editor Command
		 * @returns {string} The color applied to the current selection or the default value
		 * @private
		 */
		ToolbarWrapper.prototype._getColor = function (sCommand) {
			var oRTE = this.getEditor(),
				oCommandStyle = EditorCommands[sCommand].style,
				oNode = oRTE && oRTE.getNativeApi().selection.getNode(),
				aNodes = oRTE && oRTE.getNativeApi().dom.getParents(oNode),
				i, aCurrentNode, sColor;

			for (i = 0; i < aNodes.length; i++) {
				aCurrentNode = aNodes[i];
				sColor = aCurrentNode.style[oCommandStyle];

				if (sColor && sColor != "") {
					return sColor;
				}
			}

			// If there is no color style found, return the default color
			return EditorCommands[sCommand].defaultValue;
		};


		/**
		 * Helper function for creating SplitButton Control configuration for opening ColorPalettePopovers
		 *
		 * @private
		 * @param {string} [sCommand] Editor Command
		 * @returns {object|null} The configuration object for the toolbar SplitButton which opens a command specific popover or null
		 */
		ToolbarWrapper.prototype._createSplitButtonForDialog = function (sCommand) {
			var oCommand = EditorCommands[sCommand],
				that = this,
				oDialog, oResultConfig;

			if (!oCommand) {
				return null;
			}

			oResultConfig = {
				id: this._getId(sCommand),
				tooltip: this._oResourceBundle.getText(oCommand.bundleKey),
				press: function () {
					if (sCommand === "TextColor") {
						that._applyColor(sCommand, oCommand.command, that._sTextColor);
					}
					if (sCommand === "BackgroundColor") {
						that._applyColor(sCommand, oCommand.command, that._sBackgroundColor);
					}
				},
				arrowPress: function () {
					oDialog = that.getAggregation("_custom" + sCommand + "Dialog");

					this._getArrowButton()._activeButton();
					if (!oDialog) {
						return;
					}

					oDialog.openBy(this);
				}
			};

			if (sCommand === "BackgroundColor") {
				oResultConfig.icon = IconPool.getIconURI(oCommand.icon);
			}

			return oResultConfig;
		};


		/**
		 * Helper function for creating Button Control configuration for opening dialogs.
		 *
		 * @private
		 * @param {string} [sCommand] Editor Command
		 * @returns {object|null} The configuration object for the toolbar button which opens a command specific dialog or null.
		 */
		ToolbarWrapper.prototype._createButtonForDialog = function (sCommand) {
			var oCommand = EditorCommands[sCommand],
				that = this,
				oDialog;

			if (!oCommand) {
				return null;
			}

			return {
				id: this._getId(sCommand),
				icon: IconPool.getIconURI(oCommand.icon),
				tooltip: this._oResourceBundle.getText(oCommand.bundleKey),
				text: this._oResourceBundle.getText(oCommand.bundleKey),
				press: function () {
					oDialog = that.getAggregation("_custom" + sCommand + "Dialog");

					if (!oDialog) {
						return;
					}

					switch (sCommand) {
						case "InsertImage":
							this.setPressed(true);
							that._syncImageDialogData(oDialog);
							break;
						case "InsertLink":
							that._syncLinkDialogData(oDialog);
							break;
						case "InsertTable":
							that._resetDialogContent(oDialog);
							break;
						default:
							break;
					}
					oDialog.open();
				}
			};
		};

		/**
		 * Helper function for synchronizing dialog data with image values
		 * @private
		 * @param {sap.m.Dialog} [oDialog] The Dialog to be synchronized
		 */
		ToolbarWrapper.prototype._syncImageDialogData = function (oDialog) {
			var oSelection = this.getEditor().getNativeApi().selection,
				oSelectionNode = oSelection && oSelection.getNode(),
				oDialogContent = oDialog && oDialog.getContent(),
				oDialogCheckBox, oHeightInput, oWidthInput, oSelectedNode,
				sURL, sDescription, fWidth, fHeight, oDimensionsFlexBox;

			if (!oDialogContent.length) {
				return;
			}

			oDialogCheckBox = oDialogContent[6];
			oDimensionsFlexBox = oDialogContent[5];

			if (oDimensionsFlexBox.getMetadata().getName() === "sap.m.HBox" && oDimensionsFlexBox.getAggregation("items").length) {
				oHeightInput = oDimensionsFlexBox.getAggregation("items")[2];
				oWidthInput = oDimensionsFlexBox.getAggregation("items")[0];
			}

			if (oSelectionNode.tagName.toLowerCase() === 'img') {
				oSelectedNode = oSelectionNode;
			} else {
				oSelectedNode = oSelectionNode.parentElement;
			}

			// if there isn't a selected img, the ratio checkbox
			// should be disabled and the input values should be reset
			if (oSelectedNode.tagName.toLowerCase() !== "img") {
				this._resetDialogContent(oDialog);
				return;
			}

			if (!oDialogCheckBox.getEnabled()){
				oDialogCheckBox.setEnabled(true);
			}

			// set the checkbox selecte4d value depending on the attribute for the ratio
			oDialogCheckBox.setSelected(oSelectedNode.getAttribute('data-sap-ui-rte-image-ratio') === 'true' ? true : false);

			// get the image element attributes values
			sURL = oSelectedNode.getAttribute('src');
			sDescription = oSelectedNode.getAttribute('alt');
			fWidth = parseFloat(oSelectedNode.width);
			fHeight = parseFloat(oSelectedNode.height);

			// sync the dialog data with the image tag attributes
			oDialogContent[1].setValue(sURL);
			oDialogContent[3].setValue(sDescription);

			// set the dimensions
			oHeightInput.setValue(fHeight);
			oWidthInput.setValue(fWidth);
		};

		/** Helper function for synchronizing dialog data with link values
		* @private
		* @param {sap.m.Dialog} [oDialog] The Dialog to be synchronized
		*/
		ToolbarWrapper.prototype._syncLinkDialogData = function (oDialog) {
			var aDialogContent = oDialog && oDialog.getContent(),
				oSelection, oSelectedNode, sURL, sDisplayText, sTitle,
				bTarget, oSelectionNode, bLinkPartSelected, bSelection;

			if (!(aDialogContent instanceof Array) || !aDialogContent.length) {
				return;
			}

			oSelection = this.getEditor().getNativeApi().selection;
			oSelectionNode = oSelection.getNode();
			oSelectedNode = this._getSelectionAnchor(oSelection);

			if (!oSelectedNode) {
				oSelectedNode = oSelectionNode.parentElement;
			}

			// if part of the link element is selected
			bLinkPartSelected = oSelection.getContent().length !== 0 &&
				oSelectedNode.textContent &&
				oSelection.getContent().length < oSelectedNode.textContent.length &&
				oSelectedNode.tagName === "A";

			// if there is a selected text
			bSelection = oSelection.getContent().length !== 0;

			// if there isn't a selection or a link is partly selected,
			// the display text should be equal to the text of the selection node
			if (!bSelection || bLinkPartSelected) {
				sDisplayText = oSelectedNode.text;
			} else {
				// prevents displaying the whole anchor element as a display text
				sDisplayText = (oSelection.getNode() && oSelection.getNode().tagName.toLowerCase() === 'a') ?
					oSelection.getNode().textContent :
					oSelection.getContent({format: 'text'});
			}

			sURL = oSelectedNode.getAttribute('href');
			sTitle = oSelectedNode.getAttribute('title');
			bTarget = oSelectedNode.getAttribute('target') === "true";

			aDialogContent[1].setValue(sURL);
			// sometimes there is an zero non-breaking whitespace added
			aDialogContent[3].setValue(sDisplayText && sDisplayText.replace(/\uFEFF/g,""));
			aDialogContent[5].setValue(sTitle);
			aDialogContent[6].getAggregation('items')[1].setSelectedIndex(bTarget);
		};

		/**
		 * Reset the controls in the content before opening the dialog
		 * @private
		 * @param {sap.m.Dialog} oDialog
		 */
		ToolbarWrapper.prototype._resetDialogContent = function(oDialog) {
			var aControls = oDialog.findAggregatedObjects(true),
				sControlName;

			aControls.forEach(function (oControl) {
				sControlName = oControl.getMetadata().getName();

				if (sControlName === "sap.m.Input") {
					oControl.resetProperty('value');
				} else if (sControlName === "sap.m.CheckBox") {
					oControl.resetProperty('selected')
						.setEnabled(false);
				}
			});
		};

		/**
		 * Helper function for creating Color Dialog configuration
		 *
		 * @param {string} [sType] Type of color command.
		 * @returns {object} The configuration object for the color picker dialog
		 * @private
		 */
		ToolbarWrapper.prototype._createColorPalettePopoverConfig = function(sType) {
			var oCommand = EditorCommands[sType],
				sColor = oCommand.defaultValue,
				that = this;

			return {
				defaultColor: sColor,
				colorSelect: function (oEvent) {
					var sColor = oEvent.getParameters().value;
					that._applyColor(sType, oCommand.command, sColor, oEvent.getParameter("defaultAction"));
					if (sType === "TextColor") {
						that._sTextColor = sColor;
						that._syncColors("TextColor", sColor);
					}
					if (sType === "BackgroundColor") {
						that._sBackgroundColor = sColor;
						that._syncColors("BackgroundColor", sColor);
					}
				}
			};
		};

		/**
		 * Helper function for generating image HTML content
		 *
		 * @param {string} [sURL] The URL of the HTML image tag
		 * @param {string} [sText] The alternative text of the HTML image tag
		 * @param {string} [sHeight] The height of the HTML image tag in pixels
		 * @param {string} [sWidth] The width of the HTML image tag in pixels
		 * @param {boolean} [bRatio] True if ratio of the image should be taken into consideration, when height and width are set on the image
		 * @returns {string} String representing HTML tag with the provided parameters
		 * @private
		 */
		ToolbarWrapper.prototype._generateImageHTML = function(sURL, sText, sHeight, sWidth, bRatio) {
			var sURLAttr = sURL ? ' src="' + sURL + '"' : '',
				sAltAttr = sText ? ' alt="' + sText + '"' : '',
				sHeightAttr = sHeight ? ' height="' + sHeight + 'px"' : '',
				sWidthAttr = sWidth ? ' width="' + sWidth + 'px"' : '',
				sDimensions = sHeightAttr + sWidthAttr,
				sRatio = (bRatio !== undefined) ? ' data-sap-ui-rte-image-ratio="' + bRatio + '"' : '';

			return '<img' + sURLAttr + sAltAttr + sDimensions + sRatio + '>';
		};

		/**
		 * Helper function for creating InsertImage Dialog configuration
		 *
		 * @returns {object} Configuration object of the InsertImage Dialog control
		 * @private
		 */
		ToolbarWrapper.prototype._createInsertImageConfig = function() {
			var iRationCoeff,
				oTitleBundleText = this._oResourceBundle.getText(EditorCommands["InsertImage"].bundleKey),
				oURLInput = this._helper.createInput(),
					oURLLabel = this._helper.createLabel({
						text: this._oResourceBundle.getText("INSERT_IMAGE_URL"),
						labelFor: oURLInput
					}),
					oTextInput = this._helper.createInput(),
					oTextLabel = this._helper.createLabel({
						text: this._oResourceBundle.getText("INSERT_IMAGE_DESCRIPTION"),
						labelFor: oTextInput
					}),
					oDimensionsLabel = this._helper.createLabel({
						text: this._oResourceBundle.getText("INSERT_CONTENT_DIMENSIONS"),
						labelFor: oDimensionWidthInput
					}),
					oDimensionWidthInput = this._helper.createInput({
						width: '8rem',
						fieldWidth:"6rem",
						description: 'px',
						ariaLabelledBy: oDimensionsLabel,
						change: function () {
							fnCalculateRatio(false, true);
						}
					}),
					oTextDimensions = this._helper.createText({
						textAlign: "Center",
						width: '2rem',
						text: 'x'
					}),
					oDimensionHeightInput = this._helper.createInput({
						fieldWidth: "6rem",
						width: '8rem',
						description: 'px',
						ariaLabelledBy: oDimensionsLabel,
						change: function () {
							fnCalculateRatio(true, false);
						}
					}),
					oDimensionsFlexBox = this._helper.createHBox({
						wrap: "Wrap",
						alignItems: "Center",
						justifyContent: "SpaceBetween",
						items: [oDimensionWidthInput,
								oTextDimensions,
								oDimensionHeightInput]
					}),
					oRatioCheckBox = this._helper.createCheckBox({
						select: function () {
							fnCalculateRatio(true, true);
						}
					}),
					oRatioLabel = this._helper.createLabel({
						text: this._oResourceBundle.getText("INSERT_IMAGE_RATIO"),
						labelFor: oRatioCheckBox
					}),
					oRTE = this.getEditor(),
					fnCalculateRatio = function(bCheckHeight, bCheckWidth) {
						var oSelection = oRTE && oRTE.getNativeApi().selection,
							oSelectionNode = oSelection && oSelection.getNode(),
							fWidthInputValue = parseFloat(oDimensionWidthInput.getValue()),
							fHeightInputValue = parseFloat(oDimensionHeightInput.getValue()),
							fImageWidth, fImageHeight;


						if (!oRatioCheckBox.getSelected()) {
							return;
						}

						if (oSelectionNode.tagName.toLowerCase() !== 'img' && !(oSelectionNode.parentElement && oSelectionNode.parentElement.tagName.toLowerCase() === "img")) {
							// if there isn't an selected image, there is no need of calculating values
							return;
						}

						oSelectionNode = oSelectionNode.tagName.toLowerCase() === "img" ? oSelectionNode : oSelectionNode.parentElement;

						fImageWidth = parseFloat(oSelectionNode.width);
						fImageHeight = parseFloat(oSelectionNode.height);
						iRationCoeff = fImageWidth / fImageHeight;

						if (bCheckHeight && (fHeightInputValue !== fImageHeight || fHeightInputValue != oDimensionHeightInput._lastValue)) {
							oDimensionWidthInput.setValue(fHeightInputValue * iRationCoeff);
						} else if (bCheckWidth && (fWidthInputValue !== fImageWidth || fWidthInputValue != oDimensionWidthInput._lastValue)) {
							oDimensionHeightInput.setValue(fWidthInputValue / iRationCoeff);
						}
					},
					that = this,
					aButtons = [];

				aButtons.push(this._helper.createButton({
					id: this._getId("InsertImageButton"),
					type: ButtonType.Emphasized,
					text: this._oResourceBundle.getText("DIALOG_OK_BUTTON"),
					press: function () {
						oRTE.getNativeApi()
							.insertContent(that._generateImageHTML(oURLInput.getValue(),
																		oTextInput.getValue(),
																		oDimensionHeightInput.getValue(),
																		oDimensionWidthInput.getValue(),
																		oRatioCheckBox.getSelected()));
						that.getAggregation("_customInsertImageDialog").close();
						that._syncToolbarStates(oRTE.getNativeApi());
					}
				}));

				aButtons.push(this._helper.createButton({
					id: this._getId("CancelInsertImageButton"),
					text: this._oResourceBundle.getText("DIALOG_CANCEL_BUTTON"),
					press: function () {
						that.getAggregation("_customInsertImageDialog").close();
						that._syncToolbarStates(oRTE.getNativeApi());
					}
				}));

				return {
					contentWidth: '320px',
					title: oTitleBundleText,
					buttons: aButtons,
					content: [
						oURLLabel,
						oURLInput,
						oTextLabel,
						oTextInput,
						oDimensionsLabel,
						oDimensionsFlexBox,
						oRatioCheckBox,
						oRatioLabel
					]
				};
		};

		/**
		 * Helper function for finding selected anchor HTML node
		 * @private
		 */
		ToolbarWrapper.prototype._getSelectionAnchor = function (oSelection) {
			var oSelectionNode, oAnchor;

			if (!oSelection) {
				return;
			}

			oSelectionNode = oSelection.getNode();

			if (oSelection.getStart().tagName == 'A') {
				oAnchor = oSelection.getStart();
			} else if (oSelectionNode.tagName == 'A') {
				oAnchor = oSelectionNode;
			}

			return oAnchor;
		};

		/**
		 * Helper function for generating link HTML content
		 *
		 * @param {string} [sURL] The URL of the HTML link tag
		 * @param {string} [sTitle] The title of the HTML link tag
		 * @param {boolean} [bTarget] True if the provided link should be opened in a new window
		 * @param {string} [sText] The text of the HTML link tag
		 * @private
		 */
		ToolbarWrapper.prototype._generateLinkHTML = function (sURL, sTitle, bTarget, sText) {
			var linkAttrs = {
					href: sURL  && URLListValidator.validate(sURL) ? sURL : '',
					target: bTarget ? bTarget : null,
					title: sTitle && URLListValidator.validate(sTitle) ? sTitle : ''
				},
				oNativeEditor = this.getEditor().getNativeApi(),
				oSelection = oNativeEditor.selection,
				bEventFired = false,
				oAnchor, aLinksBefore, aLinksAfter;

			// find the selected anchor element, if present
			oAnchor = this._getSelectionAnchor(oSelection);

			// if there is no url provided and no link selected, do not generate an anchor
			if (sURL === "" && !oAnchor) {
				return;
			}

			// if we delete the href of an existing anchor we should unlink it
			if (sURL === "" && oAnchor) {
				oNativeEditor.execCommand("Unlink");
				return;
			}

			if (!oAnchor) {
				// There might be links with the same URL
				aLinksBefore = oNativeEditor.dom.select('a[href="' + linkAttrs.href + '"]');

				if (sText !== "") {
					oNativeEditor.insertContent(oNativeEditor.dom.createHTML('a', linkAttrs, oNativeEditor.dom.encode(sText)));
					bEventFired = true;
				} else {
					oNativeEditor.execCommand('mceInsertLink', false, linkAttrs);
					bEventFired = true;
				}

				// Select the matching links after insertion. They'd be 1 more
				aLinksAfter = oNativeEditor.dom.select('a[href="' + linkAttrs.href + '"]');

				// Intersect and extract just the lastly inserted link
				oAnchor = aLinksAfter.filter(function (oLink) {
					return aLinksBefore.indexOf(oLink) === -1;
				})[0];
			}

			// ensure that if an anchor has a inner span (due to different styles applied)
			// the span text should be the same as the anchor text value
			// ensure that the text attribute value is the same as the innerText of the anchor
			if ("innerText" in oAnchor) {
				oAnchor.innerText = sText !== "" ? sText : sURL;
			} else {
				oAnchor.textContent = sText !== "" ? sText : sURL;
			}

			oNativeEditor.dom.setAttribs(oAnchor, linkAttrs);
			oNativeEditor.selection.select(oAnchor);

			// There should be always a "change" event when executing link edit dialog.
			// TinyMCE's actions like execCommand and insertContent would trigger a change event, but the others won't.
			if (!bEventFired) {
				oNativeEditor.fire("change");
			}
		};

		/**
		 * Helper function for creating InsertLink Dialog configuration
		 *
		 * @returns {object} Configuration object of the InsertLink Dialog control
		 * @private
		 */
		ToolbarWrapper.prototype._createInsertLinkConfig = function() {
			var oTitleBundleText = this._oResourceBundle.getText(EditorCommands["InsertLink"].bundleKey),
				oURLInput = this._helper.createInput(),
				oURLLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_LINK_URL"),
					labelFor: oURLInput
				}),
				oTextInput = this._helper.createInput(),
				oTextLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_LINK_DISPLAY_TEXT"),
					labelFor: oTextInput
				}),
				oTitleInput = this._helper.createInput(),
				oTitleLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_LINK_TITLE"),
					labelFor: oTitleInput
				}),
				oTargetSelect = this._helper.createSelect({
					id: this._getId("InsertLinkSelect"),
					items: [
						new Item({
							id: this._getId("InsertLinkSelectNone"),
							text: this._oResourceBundle.getText("INSERT_LINK_TARGET_NONE")
						}),
						new Item({
							id: this._getId("InsertLinkSelectNewWindow"),
							text: this._oResourceBundle.getText("INSERT_LINK_TARGET_NEW_WINDOW")
						})
					]
				}),
				oTargetLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_LINK_TARGET"),
					labelFor: oTargetSelect
				}),
				oTargetFlexBox = this._helper.createVBox({
					direction: "Column",
					alignItems: "Start",
					items: [oTargetLabel,
							oTargetSelect]
				}),
				oRTE = this.getEditor(),
				that = this,
				aButtons = [];

				aButtons.push(this._helper.createButton({
					id: this._getId("InsertLinkButton"),
					type: ButtonType.Emphasized,
					text: this._oResourceBundle.getText("DIALOG_OK_BUTTON"),
					press: function () {
						var bTarget = (oTargetSelect.getSelectedItem() === oTargetSelect.getItems()[1]);
						that._generateLinkHTML(oURLInput.getValue(),
							oTitleInput.getValue(),
							bTarget,
							oTextInput.getValue());
						that.getAggregation("_customInsertLinkDialog").close();
						that._syncToolbarStates(oRTE.getNativeApi());
					}
				}));

				aButtons.push(this._helper.createButton({
					id: this._getId("CancelInsertLinkButton"),
					text: this._oResourceBundle.getText("DIALOG_CANCEL_BUTTON"),
					press: function () {
						that.getAggregation("_customInsertLinkDialog").close();
						that._syncToolbarStates(oRTE.getNativeApi());
					}
				}));

				return {
					contentWidth: '320px',
					title: oTitleBundleText,
					buttons: aButtons,
					content: [
						oURLLabel,
						oURLInput,
						oTextLabel,
						oTextInput,
						oTitleLabel,
						oTitleInput,
						oTargetFlexBox
					]
				};
		};

		/**
		 * Helper function for creating InsertTable Dialog configuration
		 *
		 * @returns {object} Configuration object of the Insert Table Dialog control
		 * @private
		 */
		ToolbarWrapper.prototype._createInsertTableConfig = function() {
			var oTitleBundleText = this._oResourceBundle.getText(EditorCommands["InsertTable"].bundleKey),
				oRowsInput = this._helper.createStepInput({
					value: 2,
					min: 0,
					width: "50%"
				}),
				oRowsLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_TABLE_ROWS"),
					labelFor: oRowsInput
				}),
				oColsInput = this._helper.createStepInput({
					value: 2,
					min: 0,
					width: "50%"
				}),
				oColsLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_TABLE_COLS"),
					labelFor: oColsInput
				}),
				oDimensionsLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_CONTENT_DIMENSIONS")
				}),
				oDimensionHeightInput = this._helper.createInput({
					width: '8rem',
					fieldWidth:"6rem",
					description: 'px',
					ariaLabelledBy: oDimensionsLabel
				}),
				oTextDimensions = this._helper.createText({
					textAlign: "Center",
					width: '2rem',
					text: 'x'
				}),
				oDimensionWidthInput = this._helper.createInput({
					fieldWidth: "6rem",
					width: '8rem',
					description: 'px',
					ariaLabelledBy: oDimensionsLabel
				}),
				oDimensionsFlexBox = this._helper.createHBox({
					wrap: "Wrap",
					alignItems: "Center",
					justifyContent: "SpaceBetween",
					items: [oDimensionHeightInput,
							oTextDimensions,
							oDimensionWidthInput]
				}),
				oRTE = this.getEditor(),
				that = this,
				aButtons = [];

				aButtons.push(this._helper.createButton({
					id: this._getId("InsertTableButton"),
					text: this._oResourceBundle.getText("DIALOG_OK_BUTTON"),
					press: function () {
						var oDomRef = oRTE.getNativeApi().dom;
						var oNativeAPI = oRTE.getNativeApi();
						var oTableElm;

						if (oRTE.getEditorType() === library.EditorType.TinyMCE6) {
							oNativeAPI.execCommand('mceInsertTable', false, { rows: oRowsInput.getValue(), columns: oColsInput.getValue() });

							oTableElm = oDomRef.getParents(oNativeAPI.selection.getNode()).find(function (element) {
								return element.tagName.toLowerCase() === "table";
							});
						} else {
							oTableElm = oNativeAPI.plugins.table.insertTable(oColsInput.getValue(), oRowsInput.getValue());
						}

						oDomRef.setStyle(oTableElm, 'width', oDimensionWidthInput.getValue() + "px");
						oDomRef.setStyle(oTableElm, 'height', oDimensionHeightInput.getValue() + "px");

						that.getAggregation("_customInsertTableDialog").close();
					}
				}));

				aButtons.push(this._helper.createButton({
					id: this._getId("CancelInsertTableButton"),
					text: this._oResourceBundle.getText("DIALOG_CANCEL_BUTTON"),
					press: function () {
						that.getAggregation("_customInsertTableDialog").close();
					}
				}));

				return {
					title: oTitleBundleText,
					buttons: aButtons,
					content: this._helper.createVBox({
						direction: "Column",
						alignItems: "Start",
						items: [oRowsLabel,
								oRowsInput,
								oColsLabel,
								oColsInput,
								oDimensionsLabel,
								oDimensionsFlexBox]
						})
				};
		};

		/**
		 * Helper function for creating a sap.m.OverflowToolbar
		 *
		 * @returns {object} this instance for method chaining
		 * @private
		 */
		ToolbarWrapper.prototype._createCustomToolbar = function () {
			var oEditorHelper = this._helper,
				aContent = [],
				aGroupNames = Object.keys(ButtonGroups),
				aGroups = [],
				aGroupObjects = this.getEditor() ? this.getEditor().getButtonGroups() : [];

			// get group object for each groups, which is part of the customToolbar
			aGroupNames.forEach(function(oName){
				aGroupObjects.forEach(function(oGroup){
					if (oGroup.name === oName) {
						aGroups.push(oGroup);
					}
				});
			});

			// sort groups according to customToolbarPriority
			aGroups = this._sortToolbarContent(aGroups);

			aGroups.forEach(function(oGroup){
				aContent = aContent.concat(this._createButtonGroup(oGroup));
			}.bind(this));

			return oEditorHelper.createOverflowToolbar(this._getId(), aContent);
		};

		/**
		 * Sets the enablement of the toolbar depending on the "editable" property of the Editor
		 *
		 * @param {boolean} [bEnabled] If true, the toolbar should be enabled
		 * @param {boolean} [bSuppressInvalidate] If true, the control will not be invalidated
		 * @public
		 */
		ToolbarWrapper.prototype.setToolbarEnabled = function (bEnabled, bSuppressInvalidate) {
			var oToolbar = this.getAggregation("_toolbar");

			if (oToolbar && oToolbar.getEnabled() !== bEnabled) {
				oToolbar.setEnabled(bEnabled, bSuppressInvalidate);
			}
		};

		/**
		 * Hides/Shows button group
		 *
		 * @param {string} [sGroupName] Group name
		 * @param {boolean} [bShow] Indicates if the group should be shown or hidden
		 * @public
		 */
		ToolbarWrapper.prototype.setShowGroup = function (sGroupName, bShow) {
			var aObjects = this._findGroupedControls(sGroupName),
				oToolbar = this.getAggregation("_toolbar");

			aObjects.forEach(function (oObject) {
				oObject.setVisible(bShow);
			});

			oToolbar && oToolbar.rerender();
		};

		/**
		 * Maps the native TinyMCE style button names to ones supported by the toolbar wrapper.
		 *
		 * @param {string} sGroupName Name of the group
		 * @param {string[]} aNativeButtons Array of native TinyMCE style button names.
		 * @returns {string[]} Array of supported button names (commands).
		 * @private
		 */
		ToolbarWrapper.prototype._mapNativeButtonsToCommands = function (sGroupName, aNativeButtons) {
			var oRTE = this.getEditor();
			var aCommandsToCreate = [];
			var aSupportedButtonGroup = ButtonGroups[sGroupName];

			if (!Array.isArray(aSupportedButtonGroup) || aNativeButtons && !aNativeButtons.length) {
				return [];
			}

			// There are some special groups which do not map 1 to 1 with the native button types
			// Those groups require some special attention as they might render all buttons as single menu one
			// or create select type controls.
			switch (sGroupName) {
				case "text-align":
					aCommandsToCreate.push("TextAlign");
					break;
				case "formatselect":
				case "blocks":
				case "styleselect":
				case "styles":
					aCommandsToCreate.push("FormatBlock");
					break;
				case "insert":
					aCommandsToCreate.push("InsertImage");
					break;
				default:
					// Check the provided buttons in the group against the supported ones for this particular group from the library.
					aNativeButtons.forEach(function (sNativeButtonName) {
						var sCustomCommandName = ButtonsToCommandsMap[sNativeButtonName];

						if (aSupportedButtonGroup.indexOf(sCustomCommandName) > -1) {
							// The button is supported in the custom toolbar and can be added
							aCommandsToCreate.push(sCustomCommandName);
						} else {
							// For unsupported buttons - log warning and do not do anything
							Log.warning("Unsupported button for the custom toolbar found: " + sNativeButtonName + ", for group: " + sGroupName + ".", oRTE);
						}
					});
					break;
			}

			return aCommandsToCreate;
		};

		ToolbarWrapper.prototype._createFontToolbarContent = function (aButtonsToCreate, bVisible) {
			// All buttons in this group should be handled case by case as they are not of the same type.
			var aToolbarContent = [];
			var oAccessibilityKeys = library.Accessibility;
			var oRTE = this.getEditor();
			var that = this;

			// --- Font Family ---
			if (aButtonsToCreate.indexOf("FontFamily") !== -1) {
				var oInvisibleTextFontFamily = this._helper.createInvisibleText({
					text: this._oResourceBundle.getText(oAccessibilityKeys["FontFamily"])
				}).toStatic();
				this._registerAssociatedInvisibleTexts("font", oInvisibleTextFontFamily.getId());

				aToolbarContent.push(
					this._helper.createSelect({
						id: this._getId("FontFamily"),
						ariaLabelledBy: oInvisibleTextFontFamily,
						selectedItemId: this._getId("FontFamilyVerdana"),
						items: this._createFontStyleSelectItems(),
						change: function (oEvent) {
							var oItem;

							if (oRTE) {
								oItem = oEvent.getSource().getSelectedItem();
								oRTE.getNativeApi().execCommand('FontName', false, that._getFontStyleCommand(oItem.getText()));
							} else {
								Log.warning("Cannot execute native command: " + 'FontName');
							}
						}
					}).setVisible(bVisible)
				);
			}

			// --- Font Size ---
			if (aButtonsToCreate.indexOf("FontSize") !== -1) {
				var oInvisibleTextFontSize = this._helper.createInvisibleText({
					text: this._oResourceBundle.getText(oAccessibilityKeys["FontSize"])
				}).toStatic();
				this._registerAssociatedInvisibleTexts("font", oInvisibleTextFontSize.getId());

				aToolbarContent.push(
					this._helper.createSelect({
						id: this._getId("FontSize"),
						ariaLabelledBy: oInvisibleTextFontSize,
						selectedItemId: this._getId("FontSize2"),
						items: this._createFontSizeSelectItems(),
						change: function (oEvent) {
							var oItem;

							if (oRTE) {
								oItem = oEvent.getSource().getSelectedItem();
								oRTE.getNativeApi().execCommand('FontSize', false, oItem.getText().replace(/\s/g, ""));
							} else {
								Log.warning("Cannot execute native command: " + 'FontSize');
							}
						}
					}).setVisible(bVisible)
				);
			}

			// --- Font Color ---
			if (aButtonsToCreate.indexOf("TextColor") !== -1) {
				var oInvisibleTextFontColor = this._helper.createInvisibleText({
					text: this._oResourceBundle.getText(oAccessibilityKeys["FontColor"])
				}).toStatic();

				var oRTESplitButton = new RTESplitButton(this._createSplitButtonForDialog("TextColor")).setVisible(bVisible);
				oRTESplitButton._getTextButton().addAriaLabelledBy(oInvisibleTextFontColor);

				aToolbarContent.push(oRTESplitButton);
			}

			// --- Background Color ---
			if (aButtonsToCreate.indexOf("BackgroundColor") !== -1) {
				var oInvisibleTextBackgroundColor = this._helper.createInvisibleText({
					text: this._oResourceBundle.getText(oAccessibilityKeys["BackgroundColor"])
				}).toStatic();

				var oBackgroundColorButton = this._helper.createSplitButton(this._createSplitButtonForDialog("BackgroundColor")).setVisible(bVisible);
				oBackgroundColorButton._getTextButton().addAriaLabelledBy(oInvisibleTextBackgroundColor);
				aToolbarContent.push(oBackgroundColorButton);
			}

			return aToolbarContent;
		};

		ToolbarWrapper.prototype._createTextAlignToolbarContent = function (bVisible) {
			var oRTE = this.getEditor();
			var bGroupVisible = oRTE ? oRTE.getShowGroupFontStyle() || bVisible : false;
			var that = this;
			var bTextAlignLRight = oRTE._getTextDirection() === "rtl";
			var iDefaultItemIndex = bTextAlignLRight ? 2 : 0;
			var aMenuItems = this._createMenuButtonItems("TextAlign");

			return [
				this._helper.createMenuButton(
					this._getId("TextAlign"),
					aMenuItems,
					function (oEvent) {
						var oSelectedItem, oEditor, oSelectedItemIcon;

						if (oRTE) {
							oSelectedItem = oEvent.getParameter("item");
							oEditor = oRTE.getNativeApi();
							oSelectedItemIcon = oSelectedItem.getIcon();
							if (oSelectedItemIcon === this.getParent().getIcon()) {
								var sTextAlign = bTextAlignLRight ? "JustifyRight" : "JustifyLeft";
								// Text Align commands in TinyMCE have a toggle behavior when you set a
								// certain command twice the default command (text-align-left) will be applied
								oEditor.execCommand(sTextAlign);
							} else {
								oEditor.execCommand('Justify' + that._findTextAlignCommandByIcon(oSelectedItemIcon));
							}
						} else {
							Log.warning("Cannot execute native command: " + 'Justify');
						}
					},
					aMenuItems[iDefaultItemIndex].getIcon(),
					this._oResourceBundle.getText(EditorCommands["TextAlign"].bundleKey)
				).setVisible(bGroupVisible)
			];
		};

		ToolbarWrapper.prototype._createFormatSelectToolbarContent = function (bVisible) {
			var oRTE = this.getEditor();
			var oAccessibilityKeys = library.Accessibility;
			var oInvisibleTextFormatBlock = this._helper.createInvisibleText({
				text: this._oResourceBundle.getText(oAccessibilityKeys["FormatBlock"])
			}).toStatic();

			this._registerAssociatedInvisibleTexts("formatselect", oInvisibleTextFormatBlock.getId());

			return [
				this._helper.createSelect({
					id: this._getId("FormatBlock"),
					ariaLabelledBy: oInvisibleTextFormatBlock,
					items: this._createFormatBlockItems(),
					change: function (oEvent) {
						var oSelectedItem;
						if (oRTE) {
							oSelectedItem = oEvent.getSource().getSelectedItem();
							if (oSelectedItem) {
								var currentFormatterCommand = oRTE.getAggregation("_toolbarWrapper")._getFormatBlockCommand(oSelectedItem.getText());
								oRTE.getNativeApi().execCommand('FormatBlock', false, currentFormatterCommand);
							}
						} else {
							Log.warning("Cannot execute native command: " + 'FormatBlock');
						}
					}
				}).setVisible(bVisible)
			];
		};

		ToolbarWrapper.prototype._createFontStyleToolbarContent = function (aButtonsToCreate, bVisible) {
			var aToolbarContent = [];

			aButtonsToCreate.forEach(function (oCommand) {
				aToolbarContent.push(this._helper.createOverflowToolbarToggleButton(this._createButtonConfig(oCommand)).setVisible(bVisible));
			}, this);

			return aToolbarContent;
		};

		ToolbarWrapper.prototype._createInsertToolbarContent = function (bVisible) {
			return [this._helper.createOverflowToolbarToggleButton(this._createButtonForDialog("InsertImage")).setVisible(bVisible)];
		};

		ToolbarWrapper.prototype._createLinkToolbarContent = function (aButtonsToCreate, bVisible) {
			var aToolbarContent = [];

			// All buttons in this group should be handled case by case as they are not of the same type.
			if (aButtonsToCreate.indexOf("InsertLink") !== -1) {
				aToolbarContent.push(this._helper.createOverflowToolbarToggleButton(this._createButtonForDialog("InsertLink")).setVisible(bVisible));
			}
			if (aButtonsToCreate.indexOf("Unlink") !== -1) {
				aToolbarContent.push(this._helper.createOverflowToolbarButton(this._createButtonConfig("Unlink")).setVisible(bVisible));
			}

			return aToolbarContent;
		};

		ToolbarWrapper.prototype._createStructureToolbarContent = function (aButtonsToCreate, bVisible) {
			var aToolbarContent = [];

			aButtonsToCreate.forEach(function (oCommand) {
				aToolbarContent.push(this._helper.createOverflowToolbarButton(this._createButtonConfig(oCommand)).setVisible(bVisible));
			}, this);

			return aToolbarContent;
		};

		ToolbarWrapper.prototype._createClipboardToolbarContent = function (aButtonsToCreate, bVisible) {
			var aToolbarContent = [];

			aButtonsToCreate.forEach(function (oCommand) {
				aToolbarContent.push(this._helper.createOverflowToolbarButton(this._createButtonConfig(oCommand)).setVisible(bVisible));
			}, this);

			return aToolbarContent;
		};

		ToolbarWrapper.prototype._createUndoToolbarContent = function (aButtonsToCreate, bVisible) {
			var aToolbarContent = [];

			aButtonsToCreate.forEach(function (oCommand) {
				aToolbarContent.push(this._helper.createOverflowToolbarButton(this._createButtonConfig(oCommand)).setVisible(bVisible));
			}, this);

			return aToolbarContent;
		};

		/**
		 * Creates a Button Group for the Custom Toolbar
		 *
		 * @param {string} [mGroup] Object map containing group information.
		 * @param {string[]}   [mGroup.buttons] Array of name/IDs of the buttons in the group
		 * @param {string}     [mGroup.name] Name/ID of the group.
		 * @param {boolean}    [mGroup.visible=true] (optional) The priority of the button group. Lower priorities are added first.
		 * @param {int}        [mGroup.row=0] (optional) Row number in which the button should be
		 * @param {int}        [mGroup.priority=10] (optional) The priority of the button group. Lower priorities are added first.
		 * @param {int}        [mGroup.customToolbarPriority] (optional) The priority of the button group in the custom toolbar. Each default group in the custom toolbar has a predefined <code>customToolbarPriority</code>. Lower priorities are added in first.
		 * @returns {Array} An array containing the buttons in the group that should be added to the Custom Toolbar's content
		 * @private
		 */
		ToolbarWrapper.prototype._createButtonGroup = function (mGroup) {
			var oRTE = this.getEditor(),
				oEditorHelper = this._helper,
				aContent = [],
				aToolbarButtonsToCreate = [];

			if (!oRTE) {
				return [];
			}

			// Map native tinyMCE style button names (e.g. "bold", "forecolor") to supported by the custom toolbar button commands (e.g. "Bold", "TextColor").
			// If the group does not have "buttons" property, the default configuration for this particular group will be used.
			aToolbarButtonsToCreate = this._mapNativeButtonsToCommands(mGroup.name, mGroup.buttons);

			switch (mGroup.name) {
				case "font-style":
					aContent = this._createFontStyleToolbarContent(aToolbarButtonsToCreate, mGroup.visible);
					break;
				case "font":
					aContent = this._createFontToolbarContent(aToolbarButtonsToCreate, mGroup.visible);
					break;
				case "text-align":
					aContent = this._createTextAlignToolbarContent(mGroup.visible);
					break;
				case "styleselect":
				case "styles":
				case "blocks":
				case "formatselect":
					aContent = this._createFormatSelectToolbarContent(this._isButtonGroupAdded("styleselect") || this._isButtonGroupAdded("styles") || this._isButtonGroupAdded("blocks") || this._isButtonGroupAdded("formatselect"));
					break;
				case "structure":
					aContent = this._createStructureToolbarContent(aToolbarButtonsToCreate, mGroup.visible);
					break;
				case "clipboard":
					aContent = this._createClipboardToolbarContent(aToolbarButtonsToCreate, mGroup.visible);
					break;
				case "undo":
					aContent = this._createUndoToolbarContent(aToolbarButtonsToCreate, mGroup.visible);
					break;
				case "insert":
					aContent = this._createInsertToolbarContent(mGroup.visible);
					break;
				case "link":
					aContent = this._createLinkToolbarContent(aToolbarButtonsToCreate, mGroup.visible);
					break;
				case "table":
					aContent.push(oEditorHelper.createOverflowToolbarButton(this._createButtonForDialog("InsertTable")).setVisible(mGroup.visible));
					break;
				default: break;
			}

			return aContent;
		};

		/**
		 * Adds a Button Group to an existing Toolbar
		 *
		 * @param {map} [mGroup] Group object
		 * @returns {object} this for method chaining
		 * @public
		 */
		ToolbarWrapper.prototype.addButtonGroupToContent = function (mGroup) {
			var sGroupName;
			// if the group is generated add it to the button groups object
			// as a custom group (if it contains supported group buttons - ex."table")

			// if the group is supported (ex. "table") add it to the button groups object
			if (mGroup.name === "table") {
				sGroupName = mGroup.name;
				ButtonGroups[mGroup.name] = ["InsertTable"];
			}

			// if the group is supported (ex. "formatselect") add it to the button groups object
			if (mGroup.name === "formatselect" || mGroup.name === "styleselect" || mGroup.name === "styles" || mGroup.name === "blocks") {
				sGroupName = "formatselect";
				ButtonGroups[mGroup.name] = ["FormatBlock"];
			}

			// if not supported return and do not add content
			if (!ButtonGroups[mGroup.name] && !ButtonGroups.custom[mGroup.name]) {
				return this;
			}

			// if the group is supported and there is still not sGroupName
			// we should take the name of the group that was passed
			if (!sGroupName) {
				sGroupName = mGroup.name;
			}

			var oToolbar = this.getAggregation("_toolbar"),
				aContent = this._createButtonGroup(mGroup),
				iContentSize = aContent.length,
				i, iStartIndex;

			// find starting index of the grouped content by priority
			iStartIndex = this._findGroupPriorityPosition(mGroup);

			// reverse the buttons' array to keep their order on insertion
			aContent.reverse();
			for (i = 0; i < iContentSize; i++) {
				oToolbar.insertContent(aContent[i], iStartIndex);
			}

			return this;
		};

		ToolbarWrapper.prototype._sortToolbarContent = function (aGroups) {
			aGroups.sort(function (oGroup1, oGroup2) {
					return oGroup1.customToolbarPriority - oGroup2.customToolbarPriority;
				});

			return aGroups;
		};

		/**
		 * Helper function for finding the correct position of a group according to its customToolbarPriority
		 *
		 * @param {object} mGroup Group Object
		 * @param {string} [mGroup.name] Name of the group
		 * @param {int} [mGroup.customToolbarPriority] Predefined group priority
		 * @returns {int} The index where the first element of the group should be added
		 * @private
		 */
		ToolbarWrapper.prototype._findGroupPriorityPosition = function (mGroup) {
			var aGroups = this.getEditor().getButtonGroups(),
				iStartIndex = 0;

			// place groups without predefined customToolbarPriority at the end
			if (typeof mGroup.customToolbarPriority !== "number") {
				mGroup.customToolbarPriority = this._getLastGroupPriority(aGroups) + 10;
			}

			// sort groups according to customToolbarPriority
			aGroups = this._sortToolbarContent(aGroups);

			aGroups
				// Map all groups to supported buttons that can be created in the custom toolbar
				// based on the current group configuration
				.map(function (oGroup) {
					// We need new object that maps buttons to commands, as they do not map directly and some of the configurations
					// may have many buttons, which is then translated to single control in the custom toolbar.
					return {
						name: oGroup.name,
						iButtonsCount: this._mapNativeButtonsToCommands(oGroup.name, oGroup.buttons).length,
						customToolbarPriority: oGroup.customToolbarPriority
					};
				}.bind(this))
				// Find the correct starting index for this group, based on the customToolbarPriority group property
				.forEach(function (oMappedGroup) {
					if (oMappedGroup.customToolbarPriority < mGroup.customToolbarPriority && oMappedGroup.name !== mGroup.name) {
						// if the group exist for the customToolbar, add its button count to the startIndex
						iStartIndex += ButtonGroups[oMappedGroup.name] ? oMappedGroup.iButtonsCount : 0;
					}
				});

			return iStartIndex;
		};

		/**
		 * Helper function for finding the priority of the last group in the toolbar
		 *
		 * @param {Array} [aGroups] Group name
		 * @returns {number} The priority of the last group in the toolbar
		 * @private
		 */
		ToolbarWrapper.prototype._getLastGroupPriority = function (aGroups) {
			var aPriorities = aGroups.map(function(oGroup){
					return oGroup.customToolbarPriority || 0;
				});

			return Math.max.apply(null, aPriorities);
		};

		/**
		 * Removes a button group from the Custom Toolbar
		 *
		 * @param {string} [sGroupName] Group name
		 * @public
		 */
		ToolbarWrapper.prototype.removeButtonGroup = function (sGroupName) {
			var aObjects = this._findGroupedControls(sGroupName);

			// Detach handlers from color picker dialogs if the font group is removed
			if (sGroupName === "font") {
				this._modifyPopoverOpeningArrowHandlers(false);
			}

			// destroys associated InvisibleTexts for the group
			this._destroyAssociatedInvisibleTexts(sGroupName);

			aObjects.forEach(function (oObject) {
				oObject.destroy();
			});
		};

		/**
		 * Helper function for destroying default accessibility InvisibleTexts per group
		 *
		 * @param {string} [sGroupName] Group name
		 * @private
		 */
		ToolbarWrapper.prototype._destroyAssociatedInvisibleTexts = function (sGroupName) {
			var aIds = this._oAccessibilityTexts[sGroupName] || [];

			aIds.forEach(function(sId){
				Core.byId(sId).destroy();
			});

			this._oAccessibilityTexts[sGroupName] = [];
		};

		/**
		 * Helper function for storing accessibility InvisibleTexts' ids per group
		 *
		 * @param {string} [sGroupName] Group name
		 * @param {string} [sInvisibleTextId] Control id
		 * @private
		 */
		ToolbarWrapper.prototype._registerAssociatedInvisibleTexts = function (sGroupName, sInvisibleTextId) {
			if (!this._oAccessibilityTexts[sGroupName]){
				this._oAccessibilityTexts[sGroupName] = [];
			}

			this._oAccessibilityTexts[sGroupName].push(sInvisibleTextId);
		};

		/**
		 * Sets the button groups to the Custom Toolbar.
		 *
		 * @param {array} [aNewGroups] Array of names or objects containing the new groups information
		 * @returns {object} Control instance (for method chaining)
		 * @public
		 */
		ToolbarWrapper.prototype.setButtonGroups = function (aNewGroups) {
			var oToolbar =  this.getAggregation("_toolbar"),
				aGroups = this._getGroupsForUpdate(aNewGroups);

			if (!oToolbar) {
				return this;
			}

			aGroups.aRemovedGroups.forEach(function(oGroup){
				this.removeButtonGroup(oGroup.name);
			}.bind(this));

			// sort the groups according to their customToolbarPriority
			// before adding them to the toolbar
			aGroups.aAddedGroups = this._sortToolbarContent(aGroups.aAddedGroups);
			aGroups.aAddedGroups.forEach(function(oGroup){
				this.addButtonGroupToContent(oGroup, true);
			}.bind(this));

			return this;
		};

		/**
		 * Helper function for mapping an array of groups to stringified objects
		 *
		 * @param {Array} [aGroups] Array of groups
		 * @returns {Array} An array
		 * @private
		 */
		ToolbarWrapper.prototype._getJSONStringForGroups = function (aGroups) {
			var aStringifiedObjects = [];

			aGroups.forEach(function(oObject){
				// assure that the relevant objects properties are stringified in correct order
				// by passing an array of properties as second argument for JSON.stringify
				aStringifiedObjects.push(JSON.stringify(oObject, ["name", "visible", "customToolbarPriority", "buttons"]));
			});

			return aStringifiedObjects;
		};

		/**
		 * Helper function for added and removed groups
		 *
		 * @param {Array} [aNewGroups] Array of the new groups
		 * @returns {Object} An object containing removed groups array and added groups array
		 * @private
		 */
		ToolbarWrapper.prototype._getGroupsForUpdate = function (aNewGroups){
			var aNewStringifiedGroups = this._getJSONStringForGroups(aNewGroups),
				aOldStringifiedGroups = this._getJSONStringForGroups(this._initialButtonGroupsState),
				oGroupsForUpdate = {
					aRemovedGroups: [],
					aAddedGroups: []
				};

			aNewStringifiedGroups.forEach(function(oGroup, iIndex){
				if (aOldStringifiedGroups.indexOf(oGroup) === -1) {
					// get the group object by index
					oGroupsForUpdate.aAddedGroups.push(aNewGroups[iIndex]);
				}
			});

			aOldStringifiedGroups.forEach(function(oGroup, iIndex){
				if (aNewStringifiedGroups.indexOf(oGroup) === -1) {
					// get the group object by index
					oGroupsForUpdate.aRemovedGroups.push(this._initialButtonGroupsState[iIndex]);
				}
			}.bind(this));

			return oGroupsForUpdate;
		};

		/**
		 * Helper function for finding controls from a group
		 *
		 * @param {string} [sGroupName] Group name
		 * @returns {Array} An array containing the controls in the specified group or an empty one
		 * @private
		 */
		ToolbarWrapper.prototype._findGroupedControls = function (sGroupName) {
			var oToolbar = this.getAggregation("_toolbar"),
				aControls = [];

			if (!oToolbar) {
				return [];
			}

			if (ButtonGroups[sGroupName]) {
				aControls = ButtonGroups[sGroupName];
			} else if (ButtonGroups.custom[sGroupName]) {
				aControls = ButtonGroups.custom[sGroupName].controls;
			}

			var aIds = aControls.map(function (sName) {
				return this._getId(sName);
			}, this);

			return oToolbar.findAggregatedObjects(false, function (oAggregatedObject) {
				return aIds.indexOf(oAggregatedObject.getId()) > -1;
			}) || [];
		};

		/**
		 * Extend Toolbar's content.
		 *
		 * Allows users to add/insert/find/remove/destroy custom buttons from the Toolbar
		 * without modifying the existing content.
		 * All custom buttons are appended to the end of the Toolbar.
		 * Every action is applied *only* on the custom buttons.
		 * For example "insert" with values (new sap.m.Button(), 1) would insert that Object as a second custom button.
		 * but not as a second in the whole Toolbar.
		 *
		 * @param {string} [sModifier] Action. This is the same as aggregations' prefixes e.g. *add*Aggregation, *destroy*Aggregation, etc.
		 * @returns {*} The result of the applied action
		 * @public
		 */
		ToolbarWrapper.prototype.modifyToolbarContent = function (sModifier) {
			var vResult;
			var args = Array.prototype.slice.call(arguments);
			var oToolbar = this.getAggregation("_toolbar");

			if (!oToolbar) {
				return null;
			}

			args.shift();

			switch (sModifier) {
				case "add":
					vResult = this._proxyToolbarAdd.apply(this, args);
					break;

				case "destroy":
					vResult = this._proxyToolbarDestroy.apply(this, args);
					break;

				case "get":
					vResult = this._proxyToolbarGet.apply(this, args);
					break;

				case "indexOf":
					vResult = this._proxyToolbarIndexOf.apply(this, args);
					break;

				case "insert":
					vResult = this._proxyToolbarInsert.apply(this, args);
					break;

				case "removeAll":
					vResult = this._proxyToolbarRemoveAll.apply(this, args);
					break;

				case "remove":
					vResult = this._proxyToolbarRemove.apply(this, args);
					break;

				default:
					break;
			}

			return vResult;
		};

		ToolbarWrapper.prototype._isButtonGroupAdded = function (sGroupName) {
			var aGroups = this.getEditor().getButtonGroups(),
				bResult = false,
				i;

			for (i = 0; i < aGroups.length; i++) {
				if (aGroups[i].name === sGroupName) {
					bResult = true;
					break;
				}
			}
			return bResult;
		};

		ToolbarWrapper.prototype._updateCustomToolbarRefIds = function (sId, iInsertionIndex) {
			var aCustomButtonGroup, iItemGroupIndex;

			aCustomButtonGroup = this._customButtons || [];
			iItemGroupIndex = aCustomButtonGroup.indexOf(sId);
			if (iItemGroupIndex > -1) {
				aCustomButtonGroup.splice(iItemGroupIndex, 1);
			}

			if (iInsertionIndex !== -1) {
				iInsertionIndex = iInsertionIndex >= 0 && iInsertionIndex <= aCustomButtonGroup.length ?
					iInsertionIndex : aCustomButtonGroup.length;

				aCustomButtonGroup.splice(iInsertionIndex, 0, sId);
			}

			this._customButtons = aCustomButtonGroup;
		};

		ToolbarWrapper.prototype._proxyToolbarAdd = function (oItem) {
			var oToolbar = this.getAggregation("_toolbar"),
				vResult = oToolbar.addContent(oItem);

			oToolbar.rerender();

			if (vResult) {
				this._updateCustomToolbarRefIds(oItem.getId());
			}

			return vResult;
		};

		ToolbarWrapper.prototype._proxyToolbarGet = function () {
			var oToolbar = this.getAggregation("_toolbar"),
				aCustomButtonGroup = this._customButtons || [];

			return oToolbar.findAggregatedObjects(false, function (oAggregatedObject) {
					return aCustomButtonGroup.indexOf(oAggregatedObject.getId()) > -1;
				}) || [];
		};

		ToolbarWrapper.prototype._proxyToolbarDestroy = function () {
			var aItems = this._proxyToolbarGet();

			aItems.forEach(function (oItem) {
				oItem.destroy();
			});

			this._customButtons = [];
		};

		ToolbarWrapper.prototype._proxyToolbarIndexOf = function (vId) {
			var aCustomButtons = this._customButtons || [],
				sId = typeof vId === "object" ? vId.getId() : vId;

			return aCustomButtons.indexOf(sId);
		};

		ToolbarWrapper.prototype._proxyToolbarInsert = function (oItem, iIndex) {
			var vResult,
				oToolbar = this.getAggregation("_toolbar"),
				aToolbarContent = oToolbar.getContent() || [],
				aCustomButtons = this._customButtons || [],
				iCalculatedIndex = aToolbarContent.length - aCustomButtons.length; // Start the index right after the last not custom item.

			// Align with ManagedObject@insertAggregation
			if (iIndex < 0) { // Out of bounds
				iIndex = 0;
			} else if (iIndex > aCustomButtons.length) { // Out of bounds
				iIndex = aCustomButtons.length;
			} else if (!iIndex && iIndex !== 0) { // iIndex is not defined
				iIndex = aCustomButtons.length;
			}

			iCalculatedIndex += iIndex;

			vResult = oToolbar.insertContent(oItem, iCalculatedIndex);
			oToolbar.rerender();

			if (vResult) {
				this._updateCustomToolbarRefIds(oItem.getId(), iIndex);
			}

			return vResult;
		};

		ToolbarWrapper.prototype._proxyToolbarRemoveAll = function () {
			var aItems = this._proxyToolbarGet();

			aItems.forEach(this._proxyToolbarRemove, this);

			return aItems;
		};

		ToolbarWrapper.prototype._proxyToolbarRemove = function (vItem) {
			var sId, vResult,
				oToolbar = this.getAggregation("_toolbar");

			switch (typeof vItem) {
				case "string":
					sId = vItem;
					break;
				case "object":
					sId = vItem.getId();
					break;
				case "number":
					sId = this._customButtons[vItem];
					break;
				default:
					break;
			}

			vResult = oToolbar.removeContent(sId);

			if (vResult && sId) {
				this._updateCustomToolbarRefIds(sId, -1);
			}

			return vResult;
		};

		/**
		 * Helper function for finding controls in the Toolbar by their corresponding names.
		 *
		 * @param {string} sButtonName Custom toolbar button name (Bold, TextAlign, Italic, TextColor, etc...)
		 * @returns {sap.ui.core.Control|null} The control with the corresponding name or null.
		 */
		ToolbarWrapper.prototype._findButtonById = function (sButtonName) {
			var oRTE = this.getEditor();
			if (!oRTE) {
				return null;
			}
			return Core.byId(oRTE.getId() + this.getId() + "-" + sButtonName);
		};

		return ToolbarWrapper;
	});
