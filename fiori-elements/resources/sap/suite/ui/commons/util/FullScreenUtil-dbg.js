sap.ui.define([
	"sap/m/Dialog", "sap/ui/core/HTML"
], function(Dialog, HTML) {
	"use strict";

	/**
	 * Utility class used by controls for switching the control to fullscreen
	 */
	var FullScreenUtil = {
        toggleFullScreen: function(oControl, bIsFullScreen, oFullScreenButton, fnExternalClose) {
			var oContent;
			// Switch to full-screen mode
			if (bIsFullScreen) {
				// get the dom reference of the control
				oContent = oControl.getDomRef();

				if (oContent) {
					// Create an HTML element to add the control's DOM content in the FullScreen dialog
					if (!oControl._oHTML) {
						oControl._oHTML = new HTML({
							preferDOM: false,
							afterRendering: function() {
								if (oControl && oControl._oHTML) {
									var oHTMLContent = oControl._oHTML.getDomRef();
									// Get the current HTML Dom content
									if (oHTMLContent) {
										// stretch the content to occupy the whole space
										oHTMLContent.style.height = "100%";
										// append the control dom to HTML content
										oHTMLContent.append(oControl.getDomRef());
										oControl._prevOverflowX = oControl.getDomRef().style.overflowX;
										oControl._prevOverflowY = oControl.getDomRef().style.overflowY;
										oControl.getDomRef().style.overflowX = "";
										oControl.getDomRef().style.overflowY = "";
									}
								}
							}
						});
					}
					// Create and set a fullscreen Dialog (without headers) on the registered control instance
					if (!oControl._oFullScreenDialog) {
						oControl._oFullScreenDialog = new Dialog({
							showHeader: false,
							stretch: true,
							beforeClose: function() {
								// In case fullscreen dialog was closed due to navigation to another page/view/app, "Esc" click, etc. The dialog close
								// would be triggered externally and we need to clean up and replace the DOM content back to the original location
								if (oControl && oControl._placeHolder && fnExternalClose) {
									fnExternalClose.call(oControl, false);
								}
							},
							content: [
								oControl._oHTML
							]
						});
						// Set focus back on full-screen button of control
						if (oFullScreenButton) {
							oControl._oFullScreenDialog.attachAfterOpen(function() {
								oFullScreenButton.focus();
							});
							oControl._oFullScreenDialog.attachAfterClose(function() {
								oFullScreenButton.focus();
							});
						}
					}
					// create a dummy div node (place holder)
					oControl._placeHolder = document.createElement("div");
					// Set the place holder before the current content
					oContent.parentNode.insertBefore(oControl._placeHolder, oContent);
					// Add a dummy div as content of the HTML control
					oControl._oHTML.setContent("<div></div>");
				}
				// open the full screen Dialog
				oControl._oFullScreenDialog.open();
				// Switch back from full-screen mode
			} else if (oControl._placeHolder && oControl._oHTML) {

				// Restore control height
				var sControlHeight = oControl.getHeight && oControl.getHeight();
				var oElem = oControl.getDomRef();
				if (sControlHeight && sControlHeight !== oElem.style.height) {
					oElem.style.height = sControlHeight;
				}

				// get the HTML controls content --> as it should contain the control's current DOM ref
				oContent = oControl._oHTML.getDomRef();
				// Replace the place holder with the Controls DOM ref (child of HTML)
				oControl._placeHolder.parentNode.replaceChild(oContent.children[0], oControl._placeHolder);

				oControl._placeHolder = null;
				oContent = null;

				oControl.getDomRef().style.overflowX = oControl._prevOverflowX;
				oControl.getDomRef().style.overflowY = oControl._prevOverflowY;

				// close the full screen Dialog
				if (oControl._oFullScreenDialog) {
					oControl._oFullScreenDialog.close();
				}
			}
        },
		/**
		 * Static function that cleans up resources created for full-screen mode.<br>
		 *
		 * @param {Object} oControl - the control which can be toggled to full screen
		 * @private
		 */
		cleanUpFullScreen: function(oControl) {
			// Destroy the Dialog and hence the containing HTML control
			if (oControl._oFullScreenDialog) {
				oControl._oFullScreenDialog.destroy();
				oControl._oFullScreenDialog = null;
			}
			// clean up instance variables created for full screen mode
			oControl._placeHolder = null;
			oControl._oHTML = null;
		}
    };

	return FullScreenUtil;

}, /* bExport= */true);
