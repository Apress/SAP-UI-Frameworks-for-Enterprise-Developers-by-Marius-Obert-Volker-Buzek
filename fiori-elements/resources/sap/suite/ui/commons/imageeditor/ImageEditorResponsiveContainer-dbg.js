sap.ui.define([
	"sap/suite/ui/commons/imageeditor/ImageEditorContainer",
	"./ImageEditorContainerRenderer",
	"sap/ui/Device",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Bar",
	"sap/m/Title",
	"sap/suite/ui/commons/ControlProxy"
], function(ImageEditorContainer, ImageEditorContainerRenderer, Device, Button, Dialog, Bar, Title, ControlProxy) {
	"use strict";

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	/**
	 * Constructor for a new ImageEditorResponsiveContainer.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control acts as a wrapper around the {@link sap.suite.ui.commons.imageeditor.ImageEditor} control.
	 * It provides additional image editing capabilities for the convenience of your users.
	 * <br>This container is responsive and is rendered as a button on mobile devices.
	 *
	 * @extends sap.suite.ui.commons.imageeditor.ImageEditorContainer
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.68.0
	 *
	 * @constructor
	 * @public
	 *
	 * @alias sap.suite.ui.commons.imageeditor.ImageEditorResponsiveContainer
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var ImageEditorResponsiveContainer = ImageEditorContainer.extend("sap.suite.ui.commons.imageeditor.ImageEditorResponsiveContainer", {
		renderer: function(oRm, oControl) {
			if (!Device.system.phone || oControl._bInDialog){
				ImageEditorContainerRenderer.render.apply(this, arguments);
			} else {
				oRm.renderControl(oControl._getOpenButton());
			}
		}
	});

	ImageEditorResponsiveContainer.prototype._onImageLoaded = function() {
		ImageEditorContainer.prototype._onImageLoaded.apply(this, arguments);

		this._refreshTitle();
	};

	ImageEditorResponsiveContainer.prototype._getOpenButton = function() {
		var that = this;

		if (!this._oOpenButton) {
			this._oOpenButton = new Button({
				text: oResourceBundle.getText("IMGEDITOR_RESPONSIVE_OPEN"),
				press: function() {
					that._refreshTitle();
					that._getDialog().open();
				}
			});

			this.addDependent(this._oOpenButton);
		}

		return this._oOpenButton;
	};

	ImageEditorResponsiveContainer.prototype._getTitle = function() {
		if (!this._oTitle) {
			this._oTitle = new Title();

			this.addDependent(this._oTitle);
		}

		return this._oTitle;
	};

	ImageEditorResponsiveContainer.prototype._refreshTitle = function() {
		var oImageEditor = this.getImageEditor(),
			sTitle = oResourceBundle.getText("IMGEDITOR_DIALOG_TITLE");

		if (oImageEditor && oImageEditor.getFileName()) {
			sTitle += " - " + oImageEditor.getFileName();
		}

		this._getTitle().setText(sTitle);
	};

	ImageEditorResponsiveContainer.prototype._getDialog = function() {
		var that = this;

		if (!this._oDialog) {
			var oProxy = new ControlProxy("test");
			oProxy.setAssociation("control", this);

			this._oDialog = new Dialog({
				stretch: true,
				verticalScrolling: false,
				beforeOpen: function() {
					that._bInDialog = true;
				},
				afterOpen: function() {
					that._zoomToFit();
				},
				beforeClose: function() {
					that._bInDialog = false;
				},
				customHeader: new Bar({
					contentMiddle: [
						that._getTitle()
					],
					contentRight: [
						new Button({
							icon: "sap-icon://decline",
							press: function() {
								that._oDialog.close();
							}
						})
					]
				}),
				content: [
					oProxy
				]
			});

			this.addDependent(this._oDialog);
		}

		return this._oDialog;
	};

	return ImageEditorResponsiveContainer;

});
