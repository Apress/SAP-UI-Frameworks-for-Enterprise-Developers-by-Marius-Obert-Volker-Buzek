sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/suite/ui/commons/library",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/base/Log",
	"sap/ui/Device",
	"sap/m/MessageToast",
	"sap/ui/core/Icon",
	"./ResizeHistoryItem",
	"./RotateHistoryItem",
	"./CropRectangleHistoryItem",
	"./CropEllipseHistoryItem",
	"./CropCustomShapeHistoryItem",
	"./FilterHistoryItem",
	"./FlipHistoryItem",
	"./FilterUtils",
	"sap/ui/core/util/File",
	"sap/suite/ui/commons/Utils",
	"./ImageEditorRenderer", // renderer has to be imported in every control now
	"sap/ui/thirdparty/jqueryui/jquery-ui-draggable",
	"sap/ui/thirdparty/jqueryui/jquery-ui-resizable"
], function(jQuery, Control, library, CoreLibrary, MobileLibrary, Log, Device, MessageToast,
			Icon, ResizeHistoryItem, RotateHistoryItem, CropRectangleHistoryItem, CropEllipseHistoryItem,
			CropCustomShapeHistoryItem, FilterHistoryItem, FlipHistoryItem, FilterUtils, FileUtil, SuiteUtils) {
	"use strict";

	var ImageEditorMode = library.ImageEditorMode,
		ImageFormat = library.ImageFormat,
		oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	/**
	 * Constructor for a new ImageEditor.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Image editor displays an image and provides API and visual controls to edit it.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.66.0
	 *
	 * @constructor
	 * @public
	 *
	 * @alias sap.suite.ui.commons.imageeditor.ImageEditor
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var ImageEditor = Control.extend("sap.suite.ui.commons.imageeditor.ImageEditor", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Image source.
				 * <br>Can be a file or Blob object, a URL address of the image, a Base64 data URL string, or any other source supported by the &lt;img> HTML tag.
				 */
				src: {type: "any", defaultValue: ""},
				/**
				 * Image source for the custom shape used in custom shape cropping.
				 * <br>Can be a file or Blob object, a URL address of the image, a Base64 data URL string, or any other source supported by the &lt;img> HTML tag.
				 * <br><b>Note:</b> In Internet Explorer, <code>customShape</code> doesn't support SVG files and will throw and exception if SVG files are used.
				 */
				customShapeSrc: {type: "any", defaultValue: ""},
				/**
				 * Image editor mode.
				 * <br>Four modes are available: resize mode, crop to rectangle mode, crop to circle mode, and display
				 * image mode (default).<br>The default mode displays the image to be edited.
				 */
				mode: {type: "sap.suite.ui.commons.ImageEditorMode", defaultValue: ImageEditorMode.Default},
				/**
				 * Defines whether aspect ratio should be kept when the crop area is expanded or shrunk in the
				 * <code>CropRectangle</code> or <code>CropEllipse</code> modes ({@link sap.suite.ui.commons.ImageEditorMode}).
				 */
				keepCropAspectRatio: {type: "boolean", defaultValue: true},
				/**
				 * Defines whether aspect ratio should be kept when the image is resized in the <code>Resize</code>
				 * mode ({@link sap.suite.ui.commons.ImageEditorMode}) or using the {@link #setWidth} or {@link #setHeight} methods.
				 */
				keepResizeAspectRatio: {type: "boolean", defaultValue: true},
				/**
				 Defines the behavior of the crop area when zooming in or out.
				 <br>If set to <code>true</code>, the crop area is scaled up or down when the zoom level is changed.
				 <br>If set to <code>false</code>, the crop area remains unchanged and keeps its size.
				 */
				scaleCropArea: {type: "boolean", defaultValue: false}
			},
			events: {
				/**
				 * This event is fired after the image specified in the <code>src</code> property is successfully loaded.
				 */
				loaded: {},
				/**
				 * This event is fired if there is an error loading the image specified in the <code>src</code> property,
				 * for example, when the URL is unreachable.
				 */
				error: {},
				/**
				 * This event is fired after the image specified in the <code>customShapeSrc</code> property is successfully loaded.
				 */
				customShapeLoaded: {},
				/**
				 * This event is fired if there is an error loading the image specified in the <code>customShapeSrc</code> property,
				 * for example, when the URL is unreachable.
				 */
				customShapeError: {},
				/**
				 * This event is fired when the size of the image is changed by the user while in the <code>Resize</code>
				 * mode ({@link sap.suite.ui.commons.ImageEditorMode}).
				 */
				sizeChanged: {
					parameters: {
						width: {type: "int"},
						height: {type: "int"},
						originalWidth: {type: "int"},
						originalHeight: {type: "int"}
					}
				},
				/**
				 * This event is fired when the size of the crop area is changed by the user while in the
				 * <code>CropRectangle</code> or <code>CropEllipse</code> mode ({@link sap.suite.ui.commons.ImageEditorMode}).
				 * @param {object} cropArea
				 * @param {int} cropArea.x X coordinate of the top left corner (for rectangular crops) or the center (for circular crops) of the crop area
				 * @param {int} cropArea.y Y coordinate of the top left corner (for rectangular crops) or the center (for circular crops) of the crop area
				 * @param {int} cropArea.width Width of the crop area
				 * @param {int} cropArea.height Height of the crop area
				 * @param {object} originalCropArea
				 * @param {int} originalCropArea.x X coordinate of the top left corner (for rectangular crops) or the center (for circular crops) of the original crop area
				 * @param {int} originalCropArea.y Y coordinate of the top left corner (for rectangular crops) or the center (for circular crops) of the original crop area
				 * @param {int} originalCropArea.width Width of the original crop area
				 * @param {int} originalCropArea.height Height of the original crop area
				 */
				cropAreaChanged: {
					parameters: {
						cropArea: {type: "object"},
						originalCropArea: {type: "object"}
					}
				},
				/**
				 * This event is fired when the zoom level is changed by the user interaction.
				 */
				zoomChanged: {
					parameters: {
						zoom: {type: "int"}
					}
				},
				/**
				 * This event is fired each time there is a change in the history of recent actions or in the recent actions
				 * history index.
				 * <br>This may happen either when an action is performed on the image or when the {@link #undo}, {@link #redo}, or
				 * {@link #jumpToHistory} methods are called.
				 */
				historyChanged: {
					history: {type: "sap.suite.ui.commons.imageeditor.HistoryItem[]"},
					index: {type: "int"}
				}
			}
		}
	});

	ImageEditor.LIMITS = Object.freeze({
		WIDTH_MIN: 1, WIDTH_MAX: 8192,
		HEIGHT_MIN: 1, HEIGHT_MAX: 8192,
		MAX_CANVAS_SIZE: 67108864, // 8192*8192
		MAX_SAFARI_MOBILE_CANVAS_SIZE: 16777216, // 4096*4096
		ROTATION_MIN: -360, ROTATION_MAX: 360,
		SEPIA_MIN: 0, SEPIA_MAX: 100,
		GRAYSCALE_MIN: 0, GRAYSCALE_MAX: 100,
		SATURATE_MIN: 0, SATURATE_MAX: 500,
		INVERT_MIN: 0, INVERT_MAX: 100,
		BRIGHTNESS_MIN: 0, BRIGHTNESS_MAX: 500,
		CONTRAST_MIN: 0, CONTRAST_MAX: 500,
		CROP_AREA_MIN: 1
	});

	ImageEditor.ZOOM_MILESTONES = [5, 10, 25, 33, 50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500];

	var CONSTANTS = Object.freeze({
		// Crop area set with setCropAreaByRatio shouldn't overlay the whole image. Instead it takes up 80% of the shorter side and the other side is calculated to keep aspect ratio.
		CROP_AREA_SHORTER_SIDE_OFFSET: 0.8,
		DEFAULT_ZOOM_MILESTONE: 100
	});


	/* =========================================================== */
	/* Life cycle methods											*/
	/* =========================================================== */
	ImageEditor.prototype.init = function() {
		// keep the canvas element here instead of in the renderer, to keep its state even after rerendering
		this._oCanvas = document.createElement("canvas"); // the current state of the image
		this._initCanvas();
		this._initOrigImg();
		this._initCustomShapeImg();

		this._fZoom = CONSTANTS.DEFAULT_ZOOM_MILESTONE;

		this._oSavedImg = document.createElement("canvas"); // stores the last saved state of the image, canvas seems to be faster than img for this
		this._oSavedImg.width = 0;
		this._oSavedImg.height = 0;
	};

	ImageEditor.prototype._initOrigImg = function() {
		var that = this;

		this._oOrigImg = new Image(); // stores the loaded image
		// remedy for some problem with cross origin images
		// https://stackoverflow.com/questions/22097747/how-to-fix-getimagedata-error-the-canvas-has-been-tainted-by-cross-origin-data
		this._oOrigImg.crossOrigin = "Anonymous";
		this._oOrigImg.onload = function() {
			that._bImageLoaded = true;
			// copy the original image into canvas
			that._drawImage(that._oOrigImg);
			that._storeCurrentImg();
			that._applyExifOrientation();

			if (that._isReady()) {
				that._onAfterIsReady();
			}

			if (that.getCustomShapeLoaded() && !Device.browser.msie) {
				// custom shape mask has to be rerenderd because it needs to be adapted to the new image size
				that._renderCustomShapeMask();
			}

			that.fireLoaded();
		};
		this._oOrigImg.onerror = function(oEvent) {
			that.fireError();
		};
	};

	ImageEditor.prototype._initCustomShapeImg = function() {
		var that = this;

		this._oCustomShapeImg = new Image();
		this._oCustomShapeImg.crossOrigin = "Anonymous";
		this._oCustomShapeImg.onload = function() {
			that._bCustomShapeLoaded = true;
			that.$().addClass("sapSuiteUiCommonsImageEditorModeCropCustomShapeLoaded");
			that._renderCustomShapeMask();
			that.fireCustomShapeLoaded();
		};
		this._oCustomShapeImg.onerror = function() {
			that.fireCustomShapeError();
		};
	};

	ImageEditor.prototype._getExifOrientation = function(oFile) {
		var oFileReader = new FileReader(),
			iOffset, oResult, oView, iLength, iMarker, iLittle, iTags, i, iError,
			CONSTANTS = {
				FIRST_CHECK: 65496,
				SECOND_CHECK: 65505,
				CORRECT_FORMAT_CHECK: 1165519206,
				LITTLE_CHECK: 18761,
				FOURTH_CHECK: 65280,
				EXIF_CHECK: 274,
				ERR_FILE_FORMAT: -2,
				OFFSET_STEP: 2, OFFSET_STEP_MED: 4, OFFSET_STEP_BIG: 6
			};


		return new Promise(function(resolve) {
			oFileReader.onload = function(oEvent) {
				oResult = oEvent.target.result;
				oView = new DataView(oResult);
				iLength = oView.byteLength;
				iOffset = 2;
				iError = 0;

				try {
					if (oView.getUint16(0, false) != CONSTANTS.FIRST_CHECK) {
						return;
					}

					while (iOffset < iLength) {
						iMarker = oView.getUint16(iOffset, false);
						iOffset += CONSTANTS.OFFSET_STEP;

						if (iMarker == CONSTANTS.SECOND_CHECK) {
							iOffset += CONSTANTS.OFFSET_STEP;

							if (oView.getUint32(iOffset, false) != CONSTANTS.CORRECT_FORMAT_CHECK) {
								return;
							}

							iOffset += CONSTANTS.OFFSET_STEP_BIG;
							iLittle = oView.getUint16(iOffset, false) == CONSTANTS.LITTLE_CHECK;
							iOffset += oView.getUint32(iOffset + CONSTANTS.OFFSET_STEP_MED, iLittle);
							iTags = oView.getUint16(iOffset, iLittle);
							iOffset += CONSTANTS.OFFSET_STEP;

							for (i = 0; i < iTags; i++) {
								if (oView.getUint16(iOffset + (i * 12), iLittle) == CONSTANTS.EXIF_CHECK) {
									return oView.getUint16(iOffset + (i * 12) + 8, iLittle);
								}
							}
						} else if ((iMarker & CONSTANTS.FOURTH_CHECK) != FOURTH_CHECK) {
							break;
						} else {
							iOffset += oView.getUint16(iOffset, false);
						}
					}
				} catch (oErr) {
					// probably wrong file format
					return resolve(CONSTANTS.ERR_FILE_FORMAT);
				}
			};

			oFileReader.readAsArrayBuffer(oFile.slice(0, 64 * 1024));
		});
	};

	ImageEditor.prototype._handleExifOrientation = function(oImg) {
		var that = this;

		this._getExifOrientation(oImg).then(
			function(iOrientation) {
				switch (iOrientation) {
					case 1:
						that._iExifRotation = 0;
						break;
					case 2:
						that._iExifRotation = 0;
						that._bExifFlip = true;
						break;
					case 3:
						that._iExifRotation = 180;
						break;
					case 4:
						that._bExifFlip = true;
						that._iExifRotation = 180;
						break;
					case 5:
						that._bExifFlip = true;
						that._iExifRotation = 90;
						break;
					case 6:
						that._iExifRotation = 90;
						break;
					case 7:
						that._bExifFlip = true;
						that._iExifRotation = -90;
						break;
					case 8:
						that._iExifRotation = -90;
						break;
					default:
						that._iExifRotation = 0;
						break;
				}

				that._applyExifOrientation();
			}
		);
	};

	ImageEditor.prototype._applyExifOrientation = function() {
		if (this.getLoaded()) {
			if (this._iExifRotation) {
				this._setRotation(this._iExifRotation);
				this._storeCurrentImg();
			}

			if (this._bExifFlip) {
				this._flipHorizontal();
				this._storeCurrentImg();
			}
		}
	};

	ImageEditor.prototype._renderCustomShapeMask = function() {
		var oCanvas = document.createElement("canvas"),
			oContext = oCanvas.getContext("2d"),
			iWidth, iHeight;

		// svg image didn't have width/height set in FF and IE when not rendered
		// render it to body to get its arbitrary size and then hide it again
		this._oCustomShapeImg.width = 500;
		this._oCustomShapeImg.height = this._oCustomShapeImg.naturalHeight * this._oCustomShapeImg.width / this._oCustomShapeImg.naturalWidth;

		jQuery("body").prepend(this._oCustomShapeImg);
		iWidth = this._oCustomShapeImg.clientWidth;
		iHeight = this._oCustomShapeImg.clientHeight;
		jQuery(this._oCustomShapeImg).remove();

		if (iWidth >= iHeight) {
			// current canvas size isnt sufficient, image can be scaled in the browser and then get blurry then the browser get larger again
			// meaning we have to use default width and height
			oCanvas.width = this._oCanvas.width;
			oCanvas.height = iHeight * (this._oCanvas.width / iWidth);
		} else {
			oCanvas.height = this._oCanvas.height;
			oCanvas.width = iWidth * (this._oCanvas.height / iHeight);
		}

		// in IE/Edge the image isn't scaled to canvas size if the width/height isn't explicitely set to that size
		this._oCustomShapeImg.width = oCanvas.width;
		this._oCustomShapeImg.height = oCanvas.height;

		// change the arbitrary color of custom svg to black, so this it can be properly used as a mask
		oContext.drawImage(this._oCustomShapeImg, 0, 0, this._oCustomShapeImg.width, this._oCustomShapeImg.height);
		oContext.globalCompositeOperation = "source-in";
		oContext.fillStyle = "black";
		oContext.fillRect(0, 0, oCanvas.width, oCanvas.height);
		this._sBlackCustomShapeUrl = oCanvas.toDataURL();

		// xlink namespace needed for IE/edge to work
		if (this.$("overlayMaskCustomBlack")[0]) {
			this.$("overlayMaskCustomBlack")[0].setAttributeNS("http://www.w3.org/1999/xlink", "href", this._sBlackCustomShapeUrl);
		}

		// render another one in white color, to use it as another mask, because <image> seemingly doesn't work in <clipPath>
		oContext.fillStyle = "white";
		oContext.fillRect(0, 0, oCanvas.width, oCanvas.height);
		this._sWhiteCustomShapeUrl = oCanvas.toDataURL();

		if (this.$("overlayMaskCustomWhite")[0]) {
			this.$("overlayMaskCustomWhite")[0].setAttributeNS("http://www.w3.org/1999/xlink", "href", this._sWhiteCustomShapeUrl);
		}
	};

	ImageEditor.prototype.onAfterRendering = function() {
		this._$Container = this.$("canvasInnerContainer");
		this._$Container.prepend(this._oCanvas);

		this._initContainer();
		this._initCropArea();

		if (this._isReady()) {
			this._onAfterIsReady();
		}
	};

	/* =========================================================== */
	/* Properties												   */
	/* =========================================================== */
	ImageEditor.prototype.setSrc = function(vSrc) {
		this.setProperty("src", vSrc, true);

		var that = this,
			sSrc, oUrl;

		this._reset();

		if (typeof vSrc === "string") {
			sSrc = vSrc;
			this._oOriginalBlob = this._fetchUrlAsBlob(sSrc).then(function(oBlob) {
				that._handleExifOrientation(oBlob);
				that._oOriginalBlob = oBlob;
				that._sOriginalFileType = oBlob.type;
			});


			if (!sSrc.startsWith("data:image")) {
				this._sOriginalFileName = this._getFileNameFromUrl(sSrc);
			}
		} else if (vSrc instanceof Blob) {
			oUrl = window.URL;
			sSrc = oUrl.createObjectURL(vSrc);
			oUrl.revokeObjectURL(vSrc);
			that._handleExifOrientation(vSrc);

			this._oOriginalBlob = vSrc;
			this._sOriginalFileType = vSrc.type;

			if (vSrc instanceof File) {
				this._sOriginalFileName = vSrc.name;
			}
		}

		if (sSrc) {
			this._oOrigImg.src = sSrc;
		} else {
			this.fireLoaded();
		}

		return this;
	};

	ImageEditor.prototype.setScaleCropArea = function(bScaleCropArea) {
		this.setProperty("scaleCropArea", bScaleCropArea, true);
		return this;
	};

	ImageEditor.prototype.setCustomShapeSrc = function(vSrc) {
		this.setProperty("customShapeSrc", vSrc, true);

		var that = this,
			sSrc, oUrl;

		that._bCustomShapeLoaded = false;

		if (typeof vSrc === "string") {
			if ((Device.browser.msie || Device.browser.firefox) && vSrc.startsWith("data:image/svg+xml;base64,")) {
				this._handleSvgString(atob(vSrc.slice("data:image/svg+xml;base64,".length)));
			} else {
				sSrc = vSrc;
			}
		} else if (vSrc instanceof Blob) {
			if (vSrc instanceof File && vSrc.type === "image/svg+xml") {
				// read the file contents into string
				var oReader = new FileReader();
				oReader.onload = function(oEvent) {
					that._handleSvgString(oEvent.target.result);
				};
				oReader.readAsText(vSrc);
			} else {
				oUrl = window.URL;
				sSrc = oUrl.createObjectURL(vSrc);
				oUrl.revokeObjectURL(vSrc);
				this._setCustomShapeSrc(sSrc);
			}
		}

		if (sSrc) {
			this._setCustomShapeSrc(sSrc);
		} else if (!vSrc) {
			this._sBlackCustomShapeUrl = "";
			this._sWhiteCustomShapeUrl = "";

			if (this.$("overlayMaskCustomBlack")[0]) {
				this.$("overlayMaskCustomBlack")[0].setAttributeNS("http://www.w3.org/1999/xlink", "href", this._sBlackCustomShapeUrl);
			}
			if (this.$("overlayMaskCustomWhite")[0]) {
				this.$("overlayMaskCustomWhite")[0].setAttributeNS("http://www.w3.org/1999/xlink", "href", this._sWhiteCustomShapeUrl);
			}

			this.$().removeClass("sapSuiteUiCommonsImageEditorModeCropCustomShapeLoaded");
			this.fireCustomShapeLoaded();
		}

		return this;
	};

	ImageEditor.prototype._handleSvgString = function(sSvg) {
		var sSrc, sSvgString;

		// rendering of SVG into canvas is bugged
		// setTimeout needs to be used to prevent errors
		// canvas.toDataURL throws security error in ie
		if (Device.browser.msie) {
			throw Error("SVG files cannot be used as shapes for custom crop in Internet Explorer. Please use a different image source or a different browser.");
		}

		// hopefully fix problem in mozilla where svg image can't be drawn to canvas without width and height set
		// https://bugzilla.mozilla.org/show_bug.cgi?id=700533

		var oSvgDoc = new DOMParser().parseFromString(sSvg, "image/svg+xml");

		if (oSvgDoc.documentElement.width.baseVal.value > 0) {
			oSvgDoc.documentElement.width.baseVal.valueAsString = oSvgDoc.documentElement.width.baseVal.value.toString() + "px";
		}
		if (oSvgDoc.documentElement.height.baseVal.value > 0) {
			oSvgDoc.documentElement.height.baseVal.valueAsString = oSvgDoc.documentElement.height.baseVal.value.toString() + "px";
		}

		sSvgString = new XMLSerializer().serializeToString(oSvgDoc);

		// create svg data uri
		sSrc = "data:image/svg+xml;base64," + btoa(sSvgString);
		this._setCustomShapeSrc(sSrc);
	};

	ImageEditor.prototype._setCustomShapeSrc = function(sSrc) {
		this._oCustomShapeImg.src = sSrc;
	};

	ImageEditor.prototype.setKeepCropAspectRatio = function(bKeepCropAspectRatio) {
		this.setProperty("keepCropAspectRatio", bKeepCropAspectRatio, true);
		this._updateResizableCropAspectRatio();
		return this;
	};

	ImageEditor.prototype.setKeepResizeAspectRatio = function(bKeepResizeAspectRatio) {
		this.setProperty("keepResizeAspectRatio", bKeepResizeAspectRatio, true);
		this._updateResizableResizeAspectRatio();
		return this;
	};

	/* =========================================================== */
	/* Public API												   */
	/* =========================================================== */

	/**
	 * Returns <code>true</code> when the <code>customShapeSrc</code> property is set and the specified image has been successfuly loaded.
	 * @return {boolean} Whether the image is loaded or not
	 * @public
	 */
	ImageEditor.prototype.getLoaded = function() {
		return !!this.getSrc() && this._bImageLoaded;
	};

	/**
	 * Returns <code>true</code> when the <code>src</code> property is set and the specified image has been successfuly loaded.
	 * @return {boolean} Whether the image is loaded or not
	 * @public
	 */
	ImageEditor.prototype.getCustomShapeLoaded = function() {
		return !!this.getCustomShapeSrc() && this._bCustomShapeLoaded;
	};

	/**
	 * Sets the size of the image in pixels.
	 * @param {int} iWidth New width of the image
	 * @param {int} iHeight New height of the image
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} Instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.setSize = function(iWidth, iHeight, bPreview) {
		this._throwIfNotLoaded("setSize");

		var iOldWidth, iOldHeight, mSize;

		iWidth = this._constraintValue(iWidth, ImageEditor.LIMITS.WIDTH_MIN, ImageEditor.LIMITS.WIDTH_MAX);
		iHeight = this._constraintValue(iHeight, ImageEditor.LIMITS.HEIGHT_MIN, ImageEditor.LIMITS.HEIGHT_MAX);

		mSize = this._limitCanvasSize(iWidth, iHeight);
		iWidth = mSize.width;
		iHeight = mSize.height;

		this._cancelPreview();

		iOldWidth = this.getWidth();
		iOldHeight = this.getHeight();

		this._setCanvasSize(iWidth, iHeight);
		this._addHistory(
			new ResizeHistoryItem({
				width: iWidth, height: iHeight, oldWidth: iOldWidth, oldHeight: iOldHeight
			}),
			bPreview
		);

		return this;
	};

	/**
	 * Gets the width of the image.
	 * @return {int} width of the last non-preview image
	 * @public
	 */
	ImageEditor.prototype.getWidth = function() {
		this._throwIfNotLoaded("getWidth");

		return this._getLastImg().width;
	};

	/**
	 * Gets the width of the currently shown image, even if it is in preview state.
	 * @return {int} width of the current image, even when in preview state
	 * @public
	 */
	ImageEditor.prototype.getPreviewWidth = function() {
		this._throwIfNotLoaded("getPreviewWidth");

		return this._oCanvas.width;
	};

	/**
	 * Sets the width of the image in pixels.
	 * <br>If the property <code>keepResizeAspectRatio</code> is set to <code>true</code>, changes the current image
	 * height as well (even in preview state).
	 * @param {int} iWidth New width of the image in pixels
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.setWidth = function(iWidth, bPreview) {
		this._throwIfNotLoaded("setWidth");

		var iOldHeight = this.getHeight(),
			iOldWidth = this.getWidth(),
			iHeight = this.getPreviewHeight(),
			mSize;

		iWidth = this._constraintValue(iWidth, ImageEditor.LIMITS.WIDTH_MIN, ImageEditor.LIMITS.WIDTH_MAX);

		if (this.getKeepResizeAspectRatio()) {
			iHeight = Math.round(iWidth * iHeight / this.getPreviewWidth());
		}

		mSize = this._limitCanvasSize(iWidth, iHeight);
		iWidth = mSize.width;
		iHeight = mSize.height;

		this._cancelPreview();
		this._setCanvasSize(iWidth, iHeight);
		this._addHistory(
			new ResizeHistoryItem({
				width: iWidth, height: iHeight, oldWidth: iOldWidth, oldHeight: iOldHeight
			}),
			bPreview
		);

		return this;
	};

	/**
	 * Returns the height of the image.
	 * @return {int} height of the last non-preview image
	 * @public
	 */
	ImageEditor.prototype.getHeight = function() {
		this._throwIfNotLoaded("getHeight");

		return this._getLastImg().height;
	};

	/**
	 * Returns the height of the currently shown image, even if it is in preview state.
	 * @return {int} height of the current image, even in preview state
	 * @public
	 */
	ImageEditor.prototype.getPreviewHeight = function() {
		this._throwIfNotLoaded("getPreviewHeight");

		return this._oCanvas.height;
	};

	/**
	 * Sets the height of the image in pixels.
	 * <br>If the property <code>keepResizeAspectRatio</code> is set to <code>true</code>, changes the current width
	 * as well (even in the preview mode).
	 * @param {int} iHeight New height of the image in pixels
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.setHeight = function(iHeight, bPreview) {
		this._throwIfNotLoaded("setHeight");

		var iOldWidth = this.getWidth(),
			iOldHeight = this.getHeight(),
			iWidth = this.getPreviewWidth(),
			mSize;

		iHeight = this._constraintValue(iHeight, ImageEditor.LIMITS.HEIGHT_MIN, ImageEditor.LIMITS.HEIGHT_MAX);

		if (this.getKeepResizeAspectRatio()) {
			iWidth = Math.round(iHeight * iWidth / this.getPreviewHeight());
		}

		mSize = this._limitCanvasSize(iWidth, iHeight);
		iWidth = mSize.width;
		iHeight = mSize.height;

		this._cancelPreview();
		this._setCanvasSize(iWidth, iHeight);
		this._addHistory(
			new ResizeHistoryItem({
				width: iWidth, height: iHeight, oldWidth: iOldWidth, oldHeight: iOldHeight
			}),
			bPreview
		);

		return this;
	};

	/**
	 * Rotates the image to the specified angle, ranging from -360 to 360 degrees.
	 * <br>Use a positive value for clockwise rotation and a negative value for counterclockwise rotation.
	 * @param {int} iDegrees Number of degrees to rotate the image. Applicable range of values is from -360 to 360
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.rotate = function(iDegrees, bPreview) {
		this._throwIfNotLoaded("rotate");

		iDegrees = this._constraintValue(iDegrees, ImageEditor.LIMITS.ROTATION_MIN, ImageEditor.LIMITS.ROTATION_MAX);

		this._cancelPreview();
		this._setRotation(iDegrees);
		this._addHistory(
			new RotateHistoryItem({
				degrees: iDegrees
			}),
			bPreview
		);

		return this;
	};

	/**
	 * Flips the whole image vertically.
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.flipVertical = function(bPreview) {
		this._throwIfNotLoaded("flipVertical");

		this._cancelPreview();
		this._flipVertical();
		this._addHistory(
			new FlipHistoryItem({
				vertical: true, horizontal: false
			}),
			bPreview
		);

		return this;
	};

	/**
	 * Flips the whole image horizontally.
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.flipHorizontal = function(bPreview) {
		this._throwIfNotLoaded("flipHorizontal");

		this._cancelPreview();
		this._flipHorizontal();
		this._addHistory(
			new FlipHistoryItem({
				vertical: false, horizontal: true
			}),
			bPreview
		);

		return this;
	};

	/**
	 * Flips the image based on the specified parameters.
	 * @param {boolean} bVertical Whether to flip the image vertically
	 * @param {boolean} bHorizontal Whether to flip the image horizontally
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.flip = function(bVertical, bHorizontal, bPreview) {
		this._throwIfNotLoaded("flip");

		this._cancelPreview();
		this._flip(bVertical, bHorizontal);
		this._addHistory(
			new FlipHistoryItem({
				vertical: bVertical, horizontal: bHorizontal
			}),
			bPreview
		);

		return this;
	};

	/**
	 * Crops the image based on the currently shown crop area.
	 * <br>This method works only when the {@link sap.suite.ui.commons.ImageEditorMode} is set to <code>CropRectangle</code>
	 * or <code>CropEllipse</code>.
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @public
	 */
	ImageEditor.prototype.applyVisibleCrop = function(bPreview) {
		this._throwIfNotReady("applyVisibleCrop");

		switch (this.getMode()) {
			case ImageEditorMode.CropRectangle: {
				this._applyRectangleCrop(bPreview);
				break;
			}
			case ImageEditorMode.CropEllipse: {
				this._applyEllipseCrop(bPreview);
				break;
			}
			case ImageEditorMode.CropCustomShape: {
				this._throwIfCustomShapeNotLoaded("applyVisibleCrop CropCustomShape");
				this._applyCustomShapeCrop(bPreview);
				break;
			}
			default: {
				Log.warning("No cropping mode is selected, applyVisibleCrop does nothing");
				break;
			}
		}
	};

	/**
	 * Crops the image to a new rectangle-shaped image based on the specified pixel parameters.
	 * @param {int} iX X coordinate of the top left corner of the crop area
	 * @param {int} iY Y coordinate of the top left corner of the crop area
	 * @param {int} iWidth Width of the crop area
	 * @param {int} iHeight Height of the crop area
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @public
	 */
	ImageEditor.prototype.rectangleCrop = function(iX, iY, iWidth, iHeight, bPreview) {
		this._throwIfNotLoaded("rectangleCrop");

		var iOldWidth = this.getWidth(),
			iOldHeight = this.getHeight();

		this._cancelPreview();
		this._rectangleCrop(iX, iY, iWidth, iHeight);
		this._addHistory(
			new CropRectangleHistoryItem({
				x: Math.round(iX), y: Math.round(iY),
				width: Math.round(iWidth), height: Math.round(iHeight),
				oldWidth: iOldWidth, oldHeight: iOldHeight
			}),
			bPreview
		);

		this._limitCurrentCropArea();
	};

	/**
	 * Crops the image to a new circular or oval shape based on the specified pixel parameters.
	 * @param {int} iX X coordinate of the center of the crop area
	 * @param {int} iY Y coordinate of the center of the crop area
	 * @param {int} iXRadius X radius of the crop area
	 * @param {int} iYRadius Y radius of the crop area
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @public
	 */
	ImageEditor.prototype.ellipseCrop = function(iX, iY, iXRadius, iYRadius, bPreview) {
		this._throwIfNotLoaded("ellipseCrop");

		var iOldWidth = this.getWidth(),
			iOldHeight = this.getHeight();

		this._cancelPreview();
		this._ellipseCrop(iX, iY, iXRadius, iYRadius);
		this._addHistory(
			new CropEllipseHistoryItem({
				x: Math.round(iX), y: Math.round(iY),
				rx: Math.round(iXRadius), ry: Math.round(iYRadius),
				width: Math.round(iXRadius * 2), height: Math.round(iYRadius * 2),
				oldWidth: iOldWidth, oldHeight: iOldHeight
			}),
			bPreview
		);

		this._limitCurrentCropArea();
	};

	/**
	 * Crops the image to a new shape based on the loaded custom shape and the specified pixel parameters.
	 * @param {int} iX X coordinate of the top left corner of the crop area
	 * @param {int} iY Y coordinate of the top left corner of the crop area
	 * @param {int} iWidth Width of the crop area
	 * @param {int} iHeight Height of the crop area
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @public
	 */
	ImageEditor.prototype.customShapeCrop = function(iX, iY, iWidth, iHeight, bPreview) {
		this._throwIfNotLoaded("customShapeCrop");
		this._throwIfCustomShapeNotLoaded("customShapeCrop");

		var iOldWidth = this.getWidth(),
			iOldHeight = this.getHeight();

		this._cancelPreview();
		this._customShapeCrop(iX, iY, iWidth, iHeight);
		this._addHistory(
			new CropCustomShapeHistoryItem({
				x: Math.round(iX), y: Math.round(iY),
				width: Math.round(iWidth), height: Math.round(iHeight),
				oldWidth: iOldWidth, oldHeight: iOldHeight
			}),
			bPreview
		);

		this._limitCurrentCropArea();
	};

	/**
	 * Sets the crop area to the position and size.
	 * <br>The size is expected to be in pixel values corresponding to the actual size of the image.
	 * <br>Crop area is automatically constrained, so that it doesn't overflow the edges of the image.
	 * @param {int} iX X coordinate of the top left corner of the crop area
	 * @param {int} iY Y coordinate of the top left corner of the crop area
	 * @param {int} iWidth Width of the crop area
	 * @param {int} iHeight Height of the crop area
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.setCropArea = function(iX, iY, iWidth, iHeight) {
		this._throwIfNotLoaded("setCropArea");

		var oCropArea = this._limitCropArea(iX, iY, iWidth, iHeight);
		this._setCropArea(oCropArea.x, oCropArea.y, oCropArea.width, oCropArea.height);
		return this;
	};

	/**
	 * Sets the size of the crop area to comply with the specified aspect ratio.
	 * <br>Centers the crop area, so that there is always some space from the edges of the image.
	 * @param {int} iWidth Ratio width
	 * @param {int} iHeight Ratio height
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.setCropAreaByRatio = function(iWidth, iHeight) {
		this._throwIfNotLoaded("setCropAreaByRatio");

		var fOriginalRatio = this._oCanvas.width / this._oCanvas.height,
			fCropRatio = iWidth / iHeight,
			fWidth, fHeight, fX, fY, oImgCoord;

		if (typeof iWidth !== "number" || typeof iHeight !== "number") {
			return this;
		}

		if (fOriginalRatio >= fCropRatio) {
			fHeight = CONSTANTS.CROP_AREA_SHORTER_SIDE_OFFSET;
			fWidth = this._oCanvas.height * fHeight * fCropRatio;
			fWidth = 100 * fWidth / this._oCanvas.width;
			fHeight *= 100;
			fX = (100 - fWidth) / 2;
			fY = (100 - fHeight) / 2;
		} else {
			fWidth = CONSTANTS.CROP_AREA_SHORTER_SIDE_OFFSET;
			fHeight = this._oCanvas.width * fWidth / fCropRatio;
			fHeight = 100 * fHeight / this._oCanvas.height;
			fWidth *= 100;
			fY = (100 - fHeight) / 2;
			fX = (100 - fWidth) / 2;
		}

		oImgCoord = this._transposePercentToImageCoordsPx(fX, fY, fWidth, fHeight);
		this._setCropArea(oImgCoord.x, oImgCoord.y, oImgCoord.width, oImgCoord.height);

		return this;
	};

	/**
	 * Sets the size of the crop area to comply with the aspect ratio of the loaded custom shape.
	 * <br>Centers the crop area, so that there is always some space from the edges of the image.
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.setCustomShapeCropAreaRatio = function() {
		this._throwIfNotLoaded("setCustomShapeCropAreaRatio");
		this._throwIfCustomShapeNotLoaded("setCustomShapeCropAreaRatio");

		this.setCropAreaByRatio(this._oCustomShapeImg.width, this._oCustomShapeImg.height);

		return this;
	};


	/**
	 * Resizes the crop area to the specified height and width.
	 * <br>The size is expected to be in pixel values corresponding to the actual size of the image.
	 * <br>Crop area is automatically constrained, so that it doesn't overflow the edges of the image.
	 * @param {int} iWidth Width of the cropping area
	 * @param {int} iHeight Height of the cropping area
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.setCropAreaBySize = function(iWidth, iHeight) {
		this._throwIfNotLoaded("setCropAreaBySize");

		var oCropArea = this._limitCropArea(null, null, iWidth, iHeight);
		// only set the crop area here without calculations, because the control doesn't have to be rendered just yet
		this._setCropArea(null, null, oCropArea.width, oCropArea.height);
		return this;
	};

	/**
	 * Gets the current crop area position and size.
	 * @return {{x: int, y: int, width: int, height: int}} Crop area with properties x, y, width, and height
	 * @public
	 */
	ImageEditor.prototype.getCropArea = function() {
		return this._oCropArea ? jQuery.extend({}, this._oCropArea) : null; // duplicate the object
	};

	/**
	 * Zooms in or out to the specified zoom level.
	 * @param {float} fZoom Level of zoom
	 * @param {object} [mParameters] Map which contains following parameters properties:
	 * @param {number} [mParameters.x=position in image corresponding to current middle of view port width] x position in the image from/to which the zoom should happen
	 * @param {number} [mParameters.y=position in image corresponding to current middle of view port width] y position in the image from/to which the zoom should happen
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.zoom = function(fZoom, mParameters) {
		this._setZoom(fZoom, mParameters);

		return this;
	};

	/**
	 * Zooms in one step closer.
	 * @param {object} [mParameters] Map that contains following parameters properties:
	 * @param {number} [mParameters.x=middle of image width] x position from/to which the zoom should happen
	 * @param {number} [mParameters.y=middle of image height] y position from/to which the zoom should happen
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.zoomIn = function(mParameters) {
		this._zoomIn(mParameters);

		return this;
	};

	/**
	 * Zooms out one step further.
	 * @param {object} [mParameters] Map that contains following parameters properties:
	 * @param {number} [mParameters.x=middle of image width] x position from/to which the zoom should happen
	 * @param {number} [mParameters.y=middle of image height] y position from/to which the zoom should happen
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.zoomOut = function(mParameters) {
		this._zoomOut(mParameters);

		return this;
	};

	/**
	 * Fits the image into the currently visible area. This method can only be called after the image is loaded and rendered.
	 * @return {sap.suite.ui.commons.imageeditor.ImageEditor} instance of the ImageEditor for method chaining
	 * @public
	 */
	ImageEditor.prototype.zoomToFit = function() {
		this._throwIfNotReady("zoomToFit");

		this._zoomToFit();

		return this;
	};

	/**
	 * Returns the current zoom level.
	 * @return {int} Current zoom level
	 * @public
	 */
	ImageEditor.prototype.getZoomLevel = function() {

		return this._fZoom;
	};

	/**
	 * Applies the sepia filter to the image.
	 * @param {int} iValue Filter strength. Applicable range of values is from 0 to 100
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @public
	 */
	ImageEditor.prototype.sepia = function(iValue, bPreview) {
		this._throwIfNotLoaded("sepia");

		this._constraintValue(iValue, ImageEditor.LIMITS.SEPIA_MIN, ImageEditor.LIMITS.SEPIA_MAX);
		this._cancelPreview();
		this._addHistory(
			new FilterHistoryItem({
				type: "sepia", value: iValue, unit: "%"
			}),
			bPreview
		);
	};

	/**
	 * Applies the grayscale filter to the image.
	 * @param {int} iValue Filter strength. Applicable range of values is from 0 to 100
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @public
	 */
	ImageEditor.prototype.grayscale = function(iValue, bPreview) {
		this._throwIfNotLoaded("grayscale");

		this._constraintValue(iValue, ImageEditor.LIMITS.GRAYSCALE_MIN, ImageEditor.LIMITS.GRAYSCALE_MAX);
		this._cancelPreview();
		this._addHistory(
			new FilterHistoryItem({
				type: "grayscale", value: iValue, unit: "%"
			}),
			bPreview
		);
	};

	/**
	 * Applies the saturation filter to the image.
	 * @param {int} iValue Amount of the filter strength. Applicable range of values is from 0 to 500
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @public
	 */
	ImageEditor.prototype.saturate = function(iValue, bPreview) {
		this._throwIfNotLoaded("saturate");

		this._constraintValue(iValue, ImageEditor.LIMITS.SATURATE_MIN, ImageEditor.LIMITS.SATURATE_MAX);
		this._cancelPreview();
		this._addHistory(
			new FilterHistoryItem({
				type: "saturate", value: iValue, unit: "%"
			}),
			bPreview
		);
	};

	/**
	 * Inverts the colors of the image.
	 * @param {int} iValue Filter strength. Applicable range of values is from 0 to 100
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @public
	 */
	ImageEditor.prototype.invert = function(iValue, bPreview) {
		this._throwIfNotLoaded("invert");

		this._constraintValue(iValue, ImageEditor.LIMITS.INVERT_MIN, ImageEditor.LIMITS.INVERT_MAX);
		this._cancelPreview();
		this._addHistory(
			new FilterHistoryItem({
				type: "invert", value: iValue, unit: "%"
			}),
			bPreview
		);
	};

	/**
	 * Applies the brightness filter to the image.
	 * @param {int} iValue Filter strength. Applicable range of values is from 0 to 500
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @public
	 */
	ImageEditor.prototype.brightness = function(iValue, bPreview) {
		this._throwIfNotLoaded("brightness");

		this._constraintValue(iValue, ImageEditor.LIMITS.BRIGHTNESS_MIN, ImageEditor.LIMITS.BRIGHTNESS_MAX);
		this._cancelPreview();
		this._addHistory(
			new FilterHistoryItem({
				type: "brightness", value: iValue, unit: "%"
			}),
			bPreview
		);
	};

	/**
	 * Applies the contrast filter to the image.
	 * @param {int} iValue Amount of the filter strength. Applicable range of values is from 0 to 500
	 * @param {boolean} bPreview Indicates whether to show this action in preview only (<code>true</code>) or record it in action history as well (<code>false</code>)
	 * @public
	 */
	ImageEditor.prototype.contrast = function(iValue, bPreview) {
		this._throwIfNotLoaded("contrast");

		this._constraintValue(iValue, ImageEditor.LIMITS.CONTRAST_MIN, ImageEditor.LIMITS.CONTRAST_MAX);
		this._cancelPreview();
		this._addHistory(
			new FilterHistoryItem({
				type: "contrast", value: iValue, unit: "%"
			}),
			bPreview
		);
	};

	/**
	 * Saves current preview to action history, if there is any.
	 * @public
	 */
	ImageEditor.prototype.applyPreview = function() {
		this._throwIfNotLoaded("applyPreview");

		this._applyPreview();
	};

	/**
	 * Cancels the current preview and restores the image to its last recorded state.
	 * @public
	 */
	ImageEditor.prototype.cancelPreview = function() {
		this._throwIfNotLoaded("cancelPreview");

		this._cancelPreview();
	};

	/**
	 * Goes one action back in the action history, if possible.
	 * @public
	 */
	ImageEditor.prototype.undo = function() {
		this._throwIfNotLoaded("undo");

		this._jumpToHistory(this._iHistoryIndex + 1);
	};

	/**
	 * Goes one action forward in the action history, if possible.
	 * @public
	 */
	ImageEditor.prototype.redo = function() {
		this._throwIfNotLoaded("redo");

		this._jumpToHistory(this._iHistoryIndex - 1);
	};

	/**
	 * Changes the state to an action history item at the given index.
	 * @param {int} iIndex Index of the history item. Newest state has the index of 0, the most recent change has the index of 1. The index increases with each preceding action.
	 * @public
	 */
	ImageEditor.prototype.jumpToHistory = function(iIndex) {
		this._throwIfNotLoaded("jumpToHistory");

		this._jumpToHistory(iIndex);
	};

	/**
	 * Returns an array of all action history items.
	 * @return {sap.suite.ui.commons.imageeditor.HistoryItem[]} Array of action history items
	 * @public
	 */
	ImageEditor.prototype.getHistory = function() {
		return this._aHistory;
	};

	/**
	 * Returns the current history index.
	 * <br>Newest state has the index of 0, the most recent change has the index of 1. The index increases with each preceding action.
	 * @return {int} Current history index
	 */
	ImageEditor.prototype.getHistoryIndex = function() {
		return this._iHistoryIndex;
	};

	/**
	 * Returns Base64 Data URL of the image in PNG format.
	 * @return {string} Base64 Data URL
	 * @public
	 */
	ImageEditor.prototype.getImagePngDataURL = function() {
		this._throwIfNotLoaded("getImagePngDataURL");

		return this._getFinalisedCanvas().toDataURL("image/png");
	};

	/**
	 * Returns Base64 Data URL of the image in JPEG format.
	 * @param {float} [fQuality] Quality of the returned image, ranging from 0 to 1. 0 means highly compressed image, 1 means uncompressed image. When no value is provided, canvas default compression level is used.
	 * @return {string} Base64 Data URL
	 * @public
	 */
	ImageEditor.prototype.getImageJpegDataURL = function(fQuality) {
		this._throwIfNotLoaded("getImageJpegDataURL");

		return this._getFinalisedCanvas().toDataURL("image/jpeg", fQuality);
	};

	/**
	 * Returns Base64 Data URL of the image in the specified format. If the format is not specified, either the original format of the image is used or PNG, if the original format is not supported by the browser's <code>canvas.toDataURL</code> method.
	 * @param {sap.suite.ui.commons.ImageFormat} [sFormat] File format of the returned Data URL. If the selected format is not suppoirted by the browser's <code>canvas.toDataURL</code> method, PNG is returned instead.
	 * @param {float} [fQuality] Only applied when JPEG format is used. Quality of the returned image, ranging from 0 to 1. 0 means highly compressed image, 1 means uncompressed image. When no value is provided, canvas default compression level is used.
	 * @return {string} Base64 Data URL
	 * @public
	 */
	ImageEditor.prototype.getImageDataURL = function(sFormat, fQuality) {
		this._throwIfNotLoaded("getImageDataURL");

		sFormat = this._convertImageFormatEnumToMime(sFormat) || this._getFileFormat();

		return this._getFinalisedCanvas().toDataURL(sFormat, fQuality);
	};

	/**
	 * Returns Blob object containing the image in the specified format. If the format is not specified, either the original format of the image is used or PNG, if the original format is not supported by the browser's <code>canvas.toDataURL</code> method.
	 * @param {sap.suite.ui.commons.ImageFormat} [sFormat] File format of the returned image Blob. If the selected format is not suppoirted by the browser's <code>canvas.toDataURL</code> method, PNG is returned instead.
	 * @param {float} [fQuality] Only applied when JPEG format is used. Quality of the returned image, ranging from 0 to 1. 0 means highly compressed image, 1 means uncompressed image. When no value is provided, canvas default compression level is used.
	 * @return {Promise} Promise that resolves into the Blob object
	 * @public
	 */
	ImageEditor.prototype.getImageAsBlob = function(sFormat, fQuality) {
		this._throwIfNotLoaded("getImageAsBlob");

		var that = this,
			oPromise;

		sFormat = this._convertImageFormatEnumToMime(sFormat) || this._getFileFormat();

		// return original file if no change has been made
		if (this._aHistory.length === 0) {
			oPromise = this._getOriginalBlob();
		} else {
			oPromise = new Promise(function(resolve, reject) {
				var oFinalisedCanvas = that._getFinalisedCanvas();

				if (oFinalisedCanvas.toBlob) {
					oFinalisedCanvas.toBlob(function(oBlob) {
						resolve(oBlob);
					}, sFormat, fQuality);
				} else {
					that._createBlob(oFinalisedCanvas, sFormat, fQuality).then(function(oBlob) {
						resolve(oBlob);
					});
				}
			});
		}

		return oPromise;
	};

	/**
	 * Opens Save As dialog in browser.
	 * @param {string} [sFileName] File name prefilled in the the save as dialog. Default name is "image".
	 * @param {sap.suite.ui.commons.ImageFormat} [sFormat] File format of the returned image Blob. If the format is not specified, either the original format of the image is used or PNG, if the original format is not supported by the browser's <code>canvas.toDataURL</code> method.
	 * @param {float} [fQuality] Only applied when JPEG format is used. Quality of the returned image, ranging from 0 to 1. 0 means highly compressed image, 1 means uncompressed image. When no value is provided, canvas default compression level is used.
	 * @public
	 */
	ImageEditor.prototype.openSaveDialog = function(sFileName, sFormat, fQuality) {
		this._throwIfNotLoaded("openSaveDialog");

		var oFinalisedCanvas,
			sExtension;

		sFileName = sFileName || this._getFileName();
		sFormat = this._convertImageFormatEnumToMime(sFormat) || this._getFileFormat();
		sExtension = sFormat.split("/")[1];

		if (this._aHistory.length === 0) {
			this._getOriginalBlob().then(function(oBlob) {
				FileUtil.save(oBlob, sFileName, sExtension, sFormat);
			});

		} else {
			oFinalisedCanvas = this._getFinalisedCanvas();

			if (oFinalisedCanvas.toBlob) {
				oFinalisedCanvas.toBlob(function(oBlob) {
					FileUtil.save(oBlob, sFileName, sExtension, sFormat);
				}, sFormat, fQuality);
			} else {
				this._createBlob(oFinalisedCanvas, sFormat, fQuality).then(function(oBlob) {
					FileUtil.save(oBlob, sFileName, sExtension, sFormat);
				});
			}
		}
	};

	/**
	 * Returns the name of the image file if a file was specified in the<code>src</code> property and its name is available. Otherwise returns an empty string.
	 * @return {string} File name
	 * @public
	 */
	ImageEditor.prototype.getFileName = function() {
		return this._getFullFileName();
	};

	/* =========================================================== */
	/* Private methods											   */
	/* =========================================================== */

	ImageEditor.prototype._throwIfNotLoaded = function(sMethod) {
		if (!this.getLoaded()) {
			throw Error("Cannot call " + sMethod + " before image is set and loaded");
		}
	};

	ImageEditor.prototype._throwIfNotReady = function(sMethod) {
		if (!this._isReady()) {
			throw Error("Cannot call " + sMethod + " before image is set and loaded and control is rendered");
		}
	};

	ImageEditor.prototype._throwIfCustomShapeNotLoaded = function(sMethod) {
		if (!this.getCustomShapeLoaded()) {
			throw Error("Cannot call " + sMethod + " before custom shape is set and loaded");
		}
	};

	ImageEditor.prototype._onAfterIsReady = function() {
		var that = this;

		this.$().removeClass("sapSuiteUiCommonsImageEditorEmpty");

		that._refreshContainerSize();


		this._$Container.css({
			width: (this._oCanvas.width * this._getScale()) + "px",
			height: (this._oCanvas.height * this._getScale()) + "px"
		});

		// init ratio to original ratio of the image
		if (!this.getCropArea()) {
			this.setCropAreaByRatio(this.getWidth(), this.getHeight());
		} else {
			this._setCropArea(this._oCropArea.x, this._oCropArea.y, this._oCropArea.width, this._oCropArea.height);
		}

		this.getDomRef().onmousewheel = this._onMouseWheel.bind(this);
		this.getDomRef().onmousedown = this._onMouseDown.bind(this);
	};

	ImageEditor.prototype._isReady = function() {
		// rendered and loaded
		return !!this._$Container && this.getLoaded();
	};

	// polyfill for IE/edge that creates Blob object from Canvas
	// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
	ImageEditor.prototype._createBlob = function(oCanvas, sType, fQuality) {
		var that = this;

		return new Promise(function(resolve, reject) {
			var sDataURL = oCanvas.toDataURL(sType, fQuality).split(",")[1];
			setTimeout(function() {
				resolve(that._convertDataUriToBlob(sDataURL, sType));
			});
		});
	};

	ImageEditor.prototype._convertDataUriToBlob = function(sB64Data, sContentType) {
		var sBinStr = atob(sB64Data),
			iLen = sBinStr.length,
			aArr = new Uint8Array(iLen);

		for (var i = 0; i < iLen; i++) {
			aArr[i] = sBinStr.charCodeAt(i);
		}

		return new Blob([aArr], {type: sContentType});
	};

	ImageEditor.prototype._fetchUrlAsBlob = function(sSrc) {
		var oPromise, aDataUriSplit, sBase64Data, sContentType;

		if (window.fetch) {
			// fetch handles both normal urls and data uris
			oPromise = fetch(sSrc).then(function(oRes) {
				return oRes.blob();
			}).then(function(oBlob) {
				return oBlob;
			});
		} else { // compatibility for IE
			if (sSrc.startsWith("data:image")) { // src is base64 encoded data uri
				aDataUriSplit = sSrc.split(",");
				sBase64Data = aDataUriSplit[1];
				sContentType = aDataUriSplit[0].split(";")[0].split(":")[1];
				oPromise = Promise.resolve(this._convertDataUriToBlob(sBase64Data, sContentType));
			} else {
				oPromise = new Promise(function(resolve, reject) {
					var oXhr = new XMLHttpRequest();

					oXhr.open("GET", sSrc);
					oXhr.responseType = "blob";
					oXhr.onreadystatechange = function() {
						if (this.readyState === XMLHttpRequest.DONE) {
							if (this.status === 200) {
								resolve(oXhr.response);
							} else {
								reject();
							}
						}
					};
					oXhr.send();
				});
			}
		}

		return oPromise;
	};

	ImageEditor.prototype._getOriginalBlob = function() {
		var oPromise;

		if (this._oOriginalBlob instanceof Promise) {
			oPromise = this._oOriginalBlob;
		} else {
			oPromise = Promise.resolve(this._oOriginalBlob);
		}

		return oPromise;
	};

	ImageEditor.prototype._getFileNameFromUrl = function(sUrl) {
		return sUrl.split("#")[0].split("?")[0].split("/").pop();
	};

	ImageEditor.prototype._getFileName = function() {
		var sFileName = this._sOriginalFileName || "image",
			iLastIndex;

		iLastIndex = sFileName.lastIndexOf(".");

		if (iLastIndex > 0) {
			sFileName = sFileName.slice(0, iLastIndex);
		}

		return sFileName;
	};

	ImageEditor.prototype._getFullFileName = function() {
		return this._sOriginalFileName;
	};

	ImageEditor.prototype._convertImageFormatEnumToMime = function(sFormat) {
		switch (sFormat) {
			case ImageFormat.Png:
				sFormat = "image/png";
				break;
			case ImageFormat.Jpeg:
				sFormat = "image/jpeg";
				break;
			default:
				break;
		}

		return sFormat;
	};

	ImageEditor.prototype._getFileFormat = function() {
		return this._sOriginalFileType;
	};

	ImageEditor.prototype._updateTransformation = function() {
		this._oCanvas.style.transform = "scale(" + this._getScale() + ")";
	};

	ImageEditor.prototype._refreshContainerSize = function() {
		if (!this._$Container || !this._$Container[0] || !this._isReady()) {
			return;
		}

		this._$Container.css({
			width: (this._oCanvas.width * this._getScale()) + "px",
			height: (this._oCanvas.height * this._getScale()) + "px"
		});

		this._refreshOverlayMask();
	};

	ImageEditor.prototype._refreshOverlayMask = function() {
		// Force trigger redraw of the rect element. Otherwise sometimes it doesn't properly scale to its current parent and remains smaller then 100% width
		// too slow to be used together with dragging
		var oOverlay = this.$().find(".sapSuiteUiCommonsImageEditorCropOverlayContainer")[0];

		if (!oOverlay || !this._$Container) {
			return;
		}

		this._$Container[0].removeChild(oOverlay);
		this._$Container[0].insertBefore(oOverlay, this._oCanvas.nextSibling);
	};

	ImageEditor.prototype._refreshCropContainerSize = function() {
		var oCropArea = this.getCropArea(),
			oPercentArea, $Crop;

		if (oCropArea) {
			oPercentArea = this._transposeImageCoordsPxToPercent(oCropArea.x, oCropArea.y, oCropArea.width, oCropArea.height);
			$Crop = this.$().find(".sapSuiteUiCommonsImageEditorCropInnerRectangle");

			// set size of the crop area
			$Crop.css({
				left: oPercentArea.x + "%",
				top: oPercentArea.y + "%"
			});
			$Crop.width(oPercentArea.width + "%");
			$Crop.height(oPercentArea.height + "%");
		}
	};

	// changes css classes for responsive behavior
	ImageEditor.prototype._refreshCropContainerLook = function() {
		function convertPixelsToRem(iPixels) {
			return iPixels / parseFloat(getComputedStyle(document.documentElement).fontSize);
		}

		var $cropRectangle = this.$().find(".sapSuiteUiCommonsImageEditorCropInnerRectangle"),
			fRemWidth = convertPixelsToRem($cropRectangle.width()),
			fRemHeight = convertPixelsToRem($cropRectangle.height()),
			fMin = Math.min(fRemWidth, fRemHeight);

		$cropRectangle.removeClass("sapSuiteUiCommonsImageEditorCropInnerRectangleSmall sapSuiteUiCommonsImageEditorCropInnerRectangleVerySmall sapSuiteUiCommonsImageEditorCropInnerRectangleExtraSmall");

		if (fMin < 1.25) {
			$cropRectangle.addClass("sapSuiteUiCommonsImageEditorCropInnerRectangleExtraSmall");
		} else if (fMin < 2) {
			$cropRectangle.addClass("sapSuiteUiCommonsImageEditorCropInnerRectangleVerySmall");
		} else if (fMin < 3) {
			$cropRectangle.addClass("sapSuiteUiCommonsImageEditorCropInnerRectangleSmall");
		}
	};

	ImageEditor.prototype._initCanvas = function() {
		this._oCanvas.id = this.getId() + "-image";
		this._oCanvas.classList.add("sapSuiteUiCommonsImageEditorCanvas");
		this._oContext = this._oCanvas.getContext("2d");
	};

	ImageEditor.prototype._initContainer = function() {
		var that = this,
			$Handlers = this.$().find(".sapSuiteUiCommonsImageEditorTransformHandlers .sapSuiteUiCommonsImageEditorHandlerContainer");

		this._$Container.resizable({
			containment: "parent",
			aspectRatio: this.getKeepResizeAspectRatio(),
			start: function(oEvent, oUi) {
				that.$("image").addClass("sapSuiteUiCommonsImageEditorCanvasResize");
				that.$("image").css("transform", "");
				// apply immediately all dimensions otherwise 'sapSuiteUiCommonsImageEditorCanvasResize' would cause distortion
				jQuery(this).css({
					top: oUi.position.top + "px",
					left: oUi.position.left + "px",
					width: oUi.size.width + "px",
					height: oUi.size.height + "px"
				});
			},
			stop: function(oEvent, oUi) {
				var fNewWidth = oUi.size.width * that._oCanvas.width / oUi.originalSize.width,
					fNewHeight = oUi.size.height * that._oCanvas.height / oUi.originalSize.height,
					iOriginalWidth = that._oCanvas.width,
					iOriginalHeight = that._oCanvas.height;

				that.$("image").removeClass("sapSuiteUiCommonsImageEditorCanvasResize");
				that._$Container.css({
					top: "",
					left: ""
				});
				that.setSize(fNewWidth, fNewHeight, true);
				that._refreshContainerSize();
				that._updateTransformation();
				that.fireSizeChanged({
					width: that.getPreviewWidth(),
					height: that.getPreviewHeight(),
					originalWidth: iOriginalWidth,
					originalHeight: iOriginalHeight
				});
			},
			handles: {
				nw: $Handlers.filter(".ui-resizable-nw"),
				ne: $Handlers.filter(".ui-resizable-ne"),
				sw: $Handlers.filter(".ui-resizable-sw"),
				se: $Handlers.filter(".ui-resizable-se"),
				n: $Handlers.filter(".ui-resizable-n"),
				s: $Handlers.filter(".ui-resizable-s"),
				w: $Handlers.filter(".ui-resizable-w"),
				e: $Handlers.filter(".ui-resizable-e")
			}
		});

		SuiteUtils._setupMobileDraggable(this._$Container);
	};

	ImageEditor.prototype._initCropArea = function() {
		var that = this,
			oBox = this.$().find(".sapSuiteUiCommonsImageEditorCropInnerRectangle"),
			$Handlers = this.$().find(".sapSuiteUiCommonsImageEditorCropInnerRectangle .sapSuiteUiCommonsImageEditorHandlerContainer"),
			oDragHandler = this.$().find(".sapSuiteUiCommonsImageEditorDragHandlerContainer")[0];

		function onChange(oEvent, oUi) {
			var oStyles = getComputedStyle(oUi.helper[0]);
			that._setOverlayMaskSize(oUi.position.left, oUi.position.top, oUi.size ? oUi.size.width : parseFloat(oStyles.width), oUi.size ? oUi.size.height : parseFloat(oStyles.height), "px");
			that._refreshCropContainerLook();
		}

		function onStop(oEvent, oUi) {
			var $this = jQuery(this),
				// need decimal numbers, getBoundingClientRect returns correct width and height but top/left is not relative to parent
				// jQuery.position returns decimal relative parent position
				oBoxRect = this.getBoundingClientRect(),
				oPos = $this.position(),
				oCoords = that._transposeViewportCoordsToImageCoords(oPos.left, oPos.top, oBoxRect.width, oBoxRect.height),
				oOriginalCropArea = that.getCropArea(),
				oCropArea;

			oCropArea = that._limitCropArea(oCoords.x, oCoords.y, oCoords.width, oCoords.height);
			that._setCropArea(oCropArea.x, oCropArea.y, oCropArea.width, oCropArea.height);

			oCropArea = that.getCropArea();
			that.fireCropAreaChanged({
				cropArea: oCropArea,
				originalCropArea: oOriginalCropArea
			});
		}

		oBox.resizable({
			// Weware, jQuery contains aspect ratio bug. It would be better to get newer jQuery version or use custom resizable
			aspectRatio: this.getKeepCropAspectRatio(), // locked aspect ratio CAUSES THE BUG WITH DISSAPPEARING
			containment: "parent",
			minWidth: ImageEditor.LIMITS.CROP_AREA_MIN,
			minHeight: ImageEditor.LIMITS.CROP_AREA_MIN,
			resize: onChange,
			stop: onStop,
			handles: {
				nw: $Handlers.filter(".ui-resizable-nw"),
				ne: $Handlers.filter(".ui-resizable-ne"),
				sw: $Handlers.filter(".ui-resizable-sw"),
				se: $Handlers.filter(".ui-resizable-se"),
				n: $Handlers.filter(".ui-resizable-n"),
				s: $Handlers.filter(".ui-resizable-s"),
				w: $Handlers.filter(".ui-resizable-w"),
				e: $Handlers.filter(".ui-resizable-e")
			}
		});

		// wheel event won't pass throught the drag handler to canvas
		// it has to be captured here as well
		oDragHandler.onmousewheel = this._onMouseWheel.bind(this);

		oBox.draggable({
			containment: "parent",
			handle: oDragHandler,
			drag: onChange,
			stop: onStop
		});

		SuiteUtils._setupMobileDraggable(oBox);

		// override the position relative that jquery draggable for some reason gives to the element
		oBox.css("position", "absolute");
	};

	ImageEditor.prototype._getLastImg = function() {
		return this._oSavedImg;
	};

	ImageEditor.prototype._storeCurrentImg = function() {
		this._oSavedImg.width = this._oCanvas.width;
		this._oSavedImg.height = this._oCanvas.height;
		this._oSavedImg.getContext("2d").drawImage(this._oCanvas, 0, 0);
	};

	// always call after the action is done, so that current image can be correctly saved
	// _cancelPreview should  be called before each action
	ImageEditor.prototype._addHistory = function(oHistoryItem, bPreview) {
		if (bPreview) {
			this._oPreview = oHistoryItem;
		} else {
			this._addNewHistory(oHistoryItem);
			this._oPreview = null;
		}

		this._updateFilters();
	};

	ImageEditor.prototype._applyPreview = function() {
		if (!this._oPreview) {
			return;
		}

		this._addNewHistory(this._oPreview);
		this._oPreview = null;
	};

	ImageEditor.prototype._addNewHistory = function(oNewHistory) {
		// remove forward history
		this._aHistory = this._aHistory.slice(this._iHistoryIndex);
		this._iHistoryIndex = 0;

		if (this._aHistory.length === 0 || !this._aHistory[0].compare(oNewHistory)) {
			this._aHistory.unshift(oNewHistory);
			this._storeCurrentImg();
			this._fireHistoryChanged();
		}
	};

	ImageEditor.prototype._cancelPreview = function() {
		if (!this._oPreview) {
			return;
		}

		this._oPreview = null;

		this._updateFilters();
		this._drawImage(this._getLastImg());
	};

	ImageEditor.prototype._jumpToHistory = function(iIndex) {
		var iCurrentIndex = this._iHistoryIndex,
			oHistoryItem,
			i;

		this._iHistoryIndex = Math.min(this._aHistory.length, Math.max(0, iIndex));

		if (iCurrentIndex === this._iHistoryIndex) {
			return;
		}

		if (iCurrentIndex < this._iHistoryIndex) { // go back
			this._drawImage(this._oOrigImg);
			this._storeCurrentImg();
			this._applyExifOrientation();

			i = this._aHistory.length - 1;

		} else { // go forward
			i = iCurrentIndex - 1;
		}

		for (i; i >= this._iHistoryIndex; i--) {
			oHistoryItem = this._aHistory[i];

			switch (oHistoryItem.getMetadata().getName()) {
				case "sap.suite.ui.commons.imageeditor.RotateHistoryItem": {
					this._setRotation(oHistoryItem.getDegrees());
					break;
				}
				case "sap.suite.ui.commons.imageeditor.ResizeHistoryItem": {
					this._setCanvasSize(oHistoryItem.getWidth(), oHistoryItem.getHeight());
					break;
				}
				case "sap.suite.ui.commons.imageeditor.FlipHistoryItem": {
					this._flip(oHistoryItem.getVertical(), oHistoryItem.getHorizontal());
					break;
				}
				case "sap.suite.ui.commons.imageeditor.FilterHistoryItem": {
					// immediately apply the slow computed canvas filter, because IE doesn't support css filters
					if (this._needsManualFilter()) {
						this._applyFilterItem(oHistoryItem);
					}
					break;
				}
				case "sap.suite.ui.commons.imageeditor.CropRectangleHistoryItem": {
					this._rectangleCrop(oHistoryItem.getX(), oHistoryItem.getY(), oHistoryItem.getWidth(), oHistoryItem.getHeight());
					break;
				}
				case "sap.suite.ui.commons.imageeditor.CropEllipseHistoryItem": {
					this._ellipseCrop(oHistoryItem.getX(), oHistoryItem.getY(), oHistoryItem.getRx(), oHistoryItem.getRy());
					break;
				}
				case "sap.suite.ui.commons.imageeditor.CropCustomShapeHistoryItem": {
					this._customShapeCrop(oHistoryItem.getX(), oHistoryItem.getY(), oHistoryItem.getWidth(), oHistoryItem.getHeight());
					break;
				}
				default: {
					break;
				}
			}
			this._storeCurrentImg();
		}

		this._updateFilters();
		this._fireHistoryChanged();
	};

	ImageEditor.prototype._fireHistoryChanged = function() {
		this.fireHistoryChanged({
			history: this._aHistory.slice(), // duplicate the history object so that the consumer doesn't chnage its data
			index: this._iHistoryIndex
		});
	};

	ImageEditor.prototype._onMouseDown = function(oEvent) {
		// only react to primary mouse button click
		// no movement is possible if zoom lvl is 100
		if (oEvent.button !== 0 || (oEvent.target !== this.getDomRef() && oEvent.target !== this._oCanvas)) {
			return;
		}

		var that = this,
			iStartX = oEvent.clientX,
			iStartY = oEvent.clientY;

		// prevent default mouse action e.g. selection of text or images
		oEvent.preventDefault();

		function onMouseMove(oEvent) {
			var iEndX = oEvent.clientX,
				iEndY = oEvent.clientY,
				deltaX = iEndX - iStartX,
				deltaY = iEndY - iStartY,
				oDomRef = that.getDomRef();

			oDomRef.scrollLeft -= deltaX;
			oDomRef.scrollTop -= deltaY;

			iStartX = iEndX;
			iStartY = iEndY;
		}

		function onMouseUp() {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		}

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
	};

	ImageEditor.prototype._onMouseWheel = function(oEvent) {
		if (!oEvent.ctrlKey) {
			return;
		}

		oEvent.preventDefault();

		var fnZoom = oEvent.wheelDeltaY > 0 ? this._zoomIn.bind(this) : this._zoomOut.bind(this);

		fnZoom({
			x: (oEvent.clientX - this._$Container[0].getBoundingClientRect().x) / this.getZoomLevel() * 100,
			y: (oEvent.clientY - this._$Container[0].getBoundingClientRect().y) / this.getZoomLevel() * 100
		});

		this.fireZoomChanged({
			zoom: this._fZoom
		});
	};

	ImageEditor.prototype._limitCropArea = function(iX, iY, iWidth, iHeight, bRespectCurrentArea) {
		var iMaxWidth = this._getMaxCropAreaWidth(bRespectCurrentArea),
			iMinWidth = this._getMinCropAreaWidth(bRespectCurrentArea),
			iMaxHeight = this._getMaxCropAreaHeight(bRespectCurrentArea),
			iMinHeight = this._getMinCropAreaHeight(bRespectCurrentArea);

		iX = iX && iX < 0 ? 0 : iX;
		iY = iY && iY < 0 ? 0 : iY;

		iWidth = this._constraintValue(iWidth, iMinWidth, iMaxWidth);
		iHeight = this._constraintValue(iHeight, iMinHeight, iMaxHeight);

		if (iX + iWidth > this.getWidth()) {
			iX -= (iX + iWidth) - this.getWidth();
		}

		if (iY + iHeight > this.getHeight()) {
			iY -= (iY + iHeight) - this.getHeight();
		}
		return {
			x: iX,
			y: iY,
			width: iWidth,
			height: iHeight
		};
	};

	ImageEditor.prototype._limitCurrentCropArea = function() {
		var oCropArea = this.getCropArea();

		if (oCropArea) {
			// prevent overflowing of the crop area after cropping
			this.setCropArea(oCropArea.x, oCropArea.y, oCropArea.width, oCropArea.height);
		}
	};

	ImageEditor.prototype._getMaxCropAreaWidth = function(bRespectCurrentArea) {
		var iMaxWidth,
			oCropArea = this.getCropArea();

		if (bRespectCurrentArea && this.getKeepCropAspectRatio() && oCropArea && this.getWidth() / this.getHeight() > oCropArea.width / oCropArea.height) {
			iMaxWidth = oCropArea.width * this._getMaxCropAreaHeight() / oCropArea.height;
		} else {
			iMaxWidth = this.getWidth();
		}

		return Math.round(iMaxWidth);
	};

	ImageEditor.prototype._getMinCropAreaWidth = function(bRespectCurrentArea) {
		var iMinWidth,
			oCropArea = this.getCropArea();

		if (bRespectCurrentArea && this.getKeepCropAspectRatio() && oCropArea && oCropArea.width > oCropArea.height) {
			oCropArea = this.getCropArea();
			iMinWidth = oCropArea.width * this._getMinCropAreaHeight() / oCropArea.height;
		} else {
			iMinWidth = ImageEditor.LIMITS.CROP_AREA_MIN;
		}

		return Math.round(iMinWidth);
	};

	ImageEditor.prototype._getMaxCropAreaHeight = function(bRespectCurrentArea) {
		var iMaxHeight,
			oCropArea = this.getCropArea();

		if (bRespectCurrentArea && this.getKeepCropAspectRatio() && oCropArea && this.getWidth() / this.getHeight() < oCropArea.width / oCropArea.height) {
			oCropArea = this.getCropArea();
			iMaxHeight = oCropArea.height * this._getMaxCropAreaWidth() / oCropArea.width;
		} else {
			iMaxHeight = this.getHeight();
		}

		return Math.round(iMaxHeight);
	};

	ImageEditor.prototype._getMinCropAreaHeight = function(bRespectCurrentArea) {
		var iMinHeight,
			oCropArea = this.getCropArea();

		if (bRespectCurrentArea && this.getKeepCropAspectRatio() && oCropArea && oCropArea.width < oCropArea.height) {
			oCropArea = this.getCropArea();
			iMinHeight = oCropArea.height * this._getMinCropAreaWidth() / oCropArea.width;
		} else {
			iMinHeight = ImageEditor.LIMITS.CROP_AREA_MIN;
		}

		return Math.round(iMinHeight);
	};

	ImageEditor.prototype._scaleCropArea = function(fOldZoom, fNewZoom) {
		var oCropArea = this.getCropArea();

		if (oCropArea && typeof oCropArea.x === "number" && typeof oCropArea.width === "number") {
			oCropArea.newWidth = oCropArea.width * (fOldZoom / fNewZoom);
			oCropArea.newHeight = oCropArea.height * (fOldZoom / fNewZoom);
			oCropArea.x += (oCropArea.width - oCropArea.newWidth) / 2;
			oCropArea.y += (oCropArea.height - oCropArea.newHeight) / 2;

			oCropArea = this._limitCropArea(oCropArea.x, oCropArea.y, oCropArea.newWidth, oCropArea.newHeight, true);
			this._setCropArea(oCropArea.x, oCropArea.y, oCropArea.width, oCropArea.height);
		}
	};

	ImageEditor.prototype._setCropArea = function(fX, fY, fWidth, fHeight) {
		// keep for rerendering and getCropArea in px
		this._oCropArea = {
			x: fX,
			y: fY,
			width: fWidth,
			height: fHeight
		};

		if (!this._isReady()) {
			return; // only continue if image is rendered and with css loaded
		}

		var oPercentArea;

		// if only width/height was set with setCropAreaBySize, compute the respective x and y
		if (typeof this._oCropArea.x !== "number") {
			this._oCropArea.x = (this.getWidth() - fWidth) / 2;
			this._oCropArea.y = (this.getHeight() - fHeight) / 2;
		}

		oPercentArea = this._transposeImageCoordsPxToPercent(this._oCropArea.x, this._oCropArea.y, this._oCropArea.width, this._oCropArea.height);

		this._refreshCropContainerSize();
		// set size of the black/white overlay
		this._setOverlayMaskSize(oPercentArea.x, oPercentArea.y, oPercentArea.width, oPercentArea.height, "%");
		this._refreshOverlayMask(); // force redraw the overlay mask
		this._refreshCropContainerLook();
		this._updateCropAreaHandlerColors();
	};

	ImageEditor.prototype._setOverlayMaskSize = function(fX, fY, fWidth, fHeight, sUnit) {
		var $mask;

		// rectangle
		$mask = this.$("overlayMaskRect");
		$mask.attr({
			x: fX + sUnit,
			y: fY + sUnit,
			width: fWidth + sUnit,
			height: fHeight + sUnit
		});

		// circle
		$mask = this.$("overlayMaskEllipse");
		$mask.attr({
			cx: (fX + fWidth / 2) + sUnit,
			cy: (fY + fHeight / 2) + sUnit,
			rx: (fWidth / 2) + sUnit,
			ry: (fHeight / 2) + sUnit
		});

		// custom shape
		$mask = this.$("overlayMaskCustomBlack");
		$mask.attr({
			x: fX + sUnit,
			y: fY + sUnit,
			width: fWidth + sUnit,
			height: fHeight + sUnit
		});
		$mask = this.$("overlayMaskCustomWhite");
		$mask.attr({
			x: fX + sUnit,
			y: fY + sUnit,
			width: fWidth + sUnit,
			height: fHeight + sUnit
		});
	};

	ImageEditor.prototype._constraintValue = function(iVal, iMin, iMax) {
		if (isNaN(iVal) || iVal < iMin) {
			iVal = iMin;
		} else if (iVal > iMax) {
			iVal = iMax;
		}

		return Math.round(iVal);
	};

	ImageEditor.prototype._setZoom = function(fZoom, mParameters) {
		var fOldZoom = this._fZoom,
			oThisDomRef = this.getDomRef(),
			oThisBoundingRect,
			oContainerBoundingRect,
			iOldClientWidth, iOldClientHeight, fOldScrollLeft, fOldScrollTop,
			fScrollLeft, fScrollTop;

		this._fZoom = parseFloat(fZoom.toFixed(2));

		if (this._fZoom <= 0) {
			this._fZoom = 1;
		}

		mParameters = mParameters || {};

		if (oThisDomRef) {
			// keep old client sizes to compensate for newly shown scrollbar width/height
			iOldClientWidth = oThisDomRef.clientWidth;
			iOldClientHeight = oThisDomRef.clientHeight;
			fOldScrollLeft = oThisDomRef.scrollLeft;
			fOldScrollTop = oThisDomRef.scrollTop;
		}

		this._updateTransformation();
		this._refreshContainerSize();

		if (oThisDomRef) {
			oThisBoundingRect = oThisDomRef.getBoundingClientRect();
			oContainerBoundingRect = this._$Container[0].getBoundingClientRect();

			// if x/y not specified, zoom to center of the imageEditor, compensate for newly shown scroll bars
			mParameters.x = mParameters.x || (oThisDomRef.clientWidth / 2 + oThisBoundingRect.x - (oContainerBoundingRect.x - ((iOldClientWidth - oThisDomRef.clientWidth) / 2))) / fOldZoom * 100;
			mParameters.y = mParameters.y || (oThisDomRef.clientHeight / 2 + oThisBoundingRect.y - (oContainerBoundingRect.y - ((iOldClientHeight - oThisDomRef.clientHeight) / 2))) / fOldZoom * 100;
		}

		if (mParameters.x && mParameters.y) {
			fScrollLeft = oThisDomRef.scrollLeft + (mParameters.x / 100 * this.getZoomLevel() - oThisDomRef.scrollLeft) - (mParameters.x / 100 * fOldZoom - fOldScrollLeft);
			fScrollTop = oThisDomRef.scrollTop + (mParameters.y / 100 * this.getZoomLevel() - oThisDomRef.scrollTop) - (mParameters.y / 100 * fOldZoom - fOldScrollTop);
		}

		if (oThisDomRef && mParameters.x) {
			oThisDomRef.scrollLeft = fScrollLeft;
		}

		if (oThisDomRef && mParameters.y) {
			oThisDomRef.scrollTop = fScrollTop;
		}

		if (this.getScaleCropArea()) {
			this._scaleCropArea(fOldZoom, this._fZoom);
		}

		this._refreshCropContainerLook();
	};

	ImageEditor.prototype._getScale = function() {
		return this._fZoom / 100;
	};

	ImageEditor.prototype._zoomIn = function(mParameters) {
		var iIndex = ImageEditor.ZOOM_MILESTONES.indexOf(this._fZoom),
			fZoom = this._fZoom,
			i;

		if (iIndex >= 0 && iIndex < ImageEditor.ZOOM_MILESTONES.length - 1) {
			fZoom = ImageEditor.ZOOM_MILESTONES[iIndex + 1];
		} else {
			for (i = 0; i < ImageEditor.ZOOM_MILESTONES.length; i++) {
				if (ImageEditor.ZOOM_MILESTONES[i] > fZoom) {
					fZoom = ImageEditor.ZOOM_MILESTONES[i];
					break;
				}
			}
		}

		this._setZoom(fZoom, mParameters);
	};

	ImageEditor.prototype._zoomOut = function(mParameters) {
		var iIndex = ImageEditor.ZOOM_MILESTONES.indexOf(this._fZoom),
			fZoom = this._fZoom,
			i;

		if (iIndex > 0) {
			fZoom = ImageEditor.ZOOM_MILESTONES[iIndex - 1];
		} else {
			for (i = ImageEditor.ZOOM_MILESTONES.length - 1; i >= 0; i--) {
				if (ImageEditor.ZOOM_MILESTONES[i] < fZoom) {
					fZoom = ImageEditor.ZOOM_MILESTONES[i];
					break;
				}
			}
		}

		this._setZoom(fZoom, mParameters);
	};

	ImageEditor.prototype._zoomToFit = function() {
		this._$Container.css({
			width: "",
			height: "",
			margin: "0px" // for some reason margin:auto causes the canvas disappear in this moment
		});

		this._oCanvas.style.maxWidth = "100%";
		this._oCanvas.style.maxHeight = "100%";
		this._oCanvas.style.transform = "";

		var fZoom = this._oCanvas.getBoundingClientRect().width * 100 / this._oCanvas.width;


		this._oCanvas.style.maxWidth = "";
		this._oCanvas.style.maxHeight = "";
		this._$Container.css({
			margin: "auto"
		});

		this.zoom(fZoom);
	};

	ImageEditor.prototype._setCanvasSize = function(iWidth, iHeight) {
		var oLastImg = this._getLastImg();

		this._oCanvas.width = iWidth;
		this._oCanvas.height = iHeight;
		this._oContext.drawImage(oLastImg, 0, 0, oLastImg.width, oLastImg.height, 0, 0, iWidth, iHeight);
		this._refreshContainerSize();
	};

	ImageEditor.prototype._setRotation = function(iRotation) {
		var oLastImg = this._getLastImg(),
			fRotationRad, mSize, fCoeff;

		fRotationRad = this._degToRad(iRotation);
		this._oCanvas.width = Math.abs(oLastImg.width * Math.cos(fRotationRad)) + Math.abs(oLastImg.height * Math.sin(fRotationRad));
		this._oCanvas.height = Math.abs(oLastImg.width * Math.sin(fRotationRad)) + Math.abs(oLastImg.height * Math.cos(fRotationRad));

		mSize = this._limitCanvasSize(this._oCanvas.width, this._oCanvas.height);
		fCoeff = mSize.width / this._oCanvas.width;
		this._oCanvas.width = mSize.width;
		this._oCanvas.height = mSize.height;

		this._oContext.save();
		// translate matrix to center so that rotation and scaling is done around center
		this._oContext.translate(this._oCanvas.width / 2, this._oCanvas.height / 2);
		this._oContext.rotate(fRotationRad);
		// translate matrix back so that image is drawn from the top left
		this._oContext.translate(-this._oCanvas.width / 2, -this._oCanvas.height / 2);
		this._oContext.drawImage(oLastImg, 0, 0, oLastImg.width, oLastImg.height, Math.round((this._oCanvas.width - oLastImg.width * fCoeff) / 2), Math.round((this._oCanvas.height - oLastImg.height * fCoeff) / 2), oLastImg.width * fCoeff, oLastImg.height * fCoeff);
		this._oContext.restore();

		// could be solved by forcing default mode when calling rotation and same way for all the other modes
		this._refreshContainerSize();
	};

	ImageEditor.prototype._flipVertical = function() {
		this._flip(true, false);
	};

	ImageEditor.prototype._flipHorizontal = function() {
		this._flip(false, true);
	};

	ImageEditor.prototype._flip = function(bVertical, bHorizontal) {
		var oLastImg = this._getLastImg(),
			oTmpCanvas = document.createElement("canvas"),
			oContext = oTmpCanvas.getContext("2d");

		oTmpCanvas.width = oLastImg.width;
		oTmpCanvas.height = oLastImg.height;

		oContext.translate(bHorizontal ? oLastImg.width : 0, bVertical ? oLastImg.height : 0);
		oContext.scale(bHorizontal ? -1 : 1, bVertical ? -1 : 1);
		oContext.drawImage(oLastImg, 0, 0);

		this._oContext.clearRect(0, 0, this._oCanvas.width, this._oCanvas.height);
		this._oContext.drawImage(oTmpCanvas, 0, 0);
	};

	ImageEditor.prototype._transposeViewportCoordsToImageCoords = function(fX, fY, fWidth, fHeight) {
		if (!this._isReady()) {
			return {
				x: 0, y: 0, width: 0, height: 0
			};
		}

		var oCanvasBoundingRect = this._oCanvas.getBoundingClientRect(),
			fRatioX = this._oCanvas.width / oCanvasBoundingRect.width,
			fRatioY = this._oCanvas.height / oCanvasBoundingRect.height;

		return {
			x: fX * fRatioX,
			y: fY * fRatioY,
			width: fWidth * fRatioX,
			height: fHeight * fRatioY
		};
	};

	ImageEditor.prototype._transposeImageCoordsToViewportCoords = function(fX, fY, fWidth, fHeight) {
		if (!this._isReady()) {
			return {
				x: 0, y: 0, width: 0, height: 0
			};
		}

		var oCanvasBoundingRect = this._oCanvas.getBoundingClientRect(),
			fRatioX = this._oCanvas.width / oCanvasBoundingRect.width,
			fRatioY = this._oCanvas.height / oCanvasBoundingRect.height;

		return {
			x: fX / fRatioX,
			y: fY / fRatioY,
			width: fWidth / fRatioX,
			height: fHeight / fRatioY
		};
	};

	ImageEditor.prototype._transposeImageCoordsPxToPercent = function(fX, fY, fWidth, fHeight) {
		return {
			x: fX * 100 / this._oCanvas.width,
			y: fY * 100 / this._oCanvas.height,
			width: fWidth * 100 / this._oCanvas.width,
			height: fHeight * 100 / this._oCanvas.height
		};
	};

	ImageEditor.prototype._transposePercentToImageCoordsPx = function(fX, fY, fWidth, fHeight) {
		return {
			x: fX * this._oCanvas.width / 100,
			y: fY * this._oCanvas.height / 100,
			width: fWidth * this._oCanvas.width / 100,
			height: fHeight * this._oCanvas.height / 100
		};
	};

	ImageEditor.prototype._transposeViewPortPxToPercent = function(fX, fY, fWidth, fHeight) {
		var oContainerRect = this._$Container[0].getBoundingClientRect();

		return {
			x: fX * 100 / oContainerRect.width,
			y: fY * 100 / oContainerRect.height,
			width: fWidth * 100 / oContainerRect.width,
			height: fHeight * 100 / oContainerRect.height
		};
	};

	ImageEditor.prototype._updateCropAreaHandlerColors = function() {
		var sColor;

		if (!this.$().find(".sapSuiteUiCommonsImageEditorCropInnerRectangle").is(":visible")) {
			return;
		}

		var that = this;

		this.$().find(".sapSuiteUiCommonsImageEditorCropInnerRectangle .sapSuiteUiCommonsImageEditorHandlerContainer").each(function() {
			var $this = jQuery(this);

			if (!$this.is(":visible") || $this.width() === 0 || $this.height() === 0) {
				return;
			}

			sColor = that._getContrastColorForElement(this);

			for (var i = 0; i < this.childElementCount; i++) {
				this.children[i].style.background = sColor;
			}
		});
	};

	ImageEditor.prototype._getContrastColorForElement = function(oElement) {
		var oCanvasRect = this._oCanvas.getBoundingClientRect(),
			oElRect = oElement.getBoundingClientRect(),
			// getBoundingClientRect in IE doesn't have x and y properties, only top and left
			oCoords = this._transposeViewportCoordsToImageCoords(oElRect.left - oCanvasRect.left, oElRect.top - oCanvasRect.top, oElRect.width, oElRect.height),
			sColor = this._getContrastColorForRectangleArea(oCoords.x, oCoords.y, oCoords.width, oCoords.height);

		return sColor;
	};

	// should i use canvas for rotation?
	ImageEditor.prototype._getContrastColorForRectangleArea = function(iX, iY, iWidth, iHeight) {
		var fAvg = this._getRectangleAreaAvg(iX, iY, iWidth, iHeight);
		return fAvg > 0.5 * 0.5 ? "white" : "black";
	};

	ImageEditor.prototype._getRectangleAreaAvg = function(iX, iY, iWidth, iHeight) {
		if (iWidth === 0 || iHeight === 0) {
			return 0;
		}

		var oImageData = this._oContext.getImageData(iX, iY, Math.ceil(iWidth), Math.ceil(iHeight)).data,
			iSum = 0,
			fR, fG, fB, fAlpha;

		for (var i = 0; i < oImageData.length; i += 4) {
			fR = 1 - (oImageData[i] / 255);
			fG = 1 - (oImageData[i + 1] / 255);
			fB = 1 - (oImageData[i + 2] / 255);
			fAlpha = oImageData[i + 3] / 255;
			iSum += (0.2126 * fR * fR + 0.7152 * fG * fG + 0.0722 * fB * fB) * fAlpha;
		}

		return iSum / (oImageData.length / 4);
	};

	// https://stackoverflow.com/a/27544578
	ImageEditor.prototype._updateResizableCropAspectRatio = function() {
		var $Box = this.$().find(".sapSuiteUiCommonsImageEditorCropInnerRectangle"),
			bKeepAspectRatio = this.getKeepCropAspectRatio();

		this._updateResizableAspectRatio($Box, bKeepAspectRatio);
	};

	ImageEditor.prototype._updateResizableResizeAspectRatio = function() {
		var bKeepAspectRatio = this.getKeepResizeAspectRatio();

		this._updateResizableAspectRatio(this._$Container, bKeepAspectRatio);
	};

	ImageEditor.prototype._updateResizableAspectRatio = function($elem, bKeepAspectRatio) {
		if ($elem && $elem.data("uiResizable")) {
			$elem.resizable("option", "aspectRatio", bKeepAspectRatio).data("uiResizable")._aspectRatio = bKeepAspectRatio;
		}
	};

	ImageEditor.prototype._applyRectangleCrop = function(bPreview) {
		var oCropAreaRect = this.$().find(".sapSuiteUiCommonsImageEditorCropInnerRectangle")[0].getBoundingClientRect(),
			oCanvasRect = this._oCanvas.getBoundingClientRect(),
			oCoords = this._transposeViewportCoordsToImageCoords(oCropAreaRect.left - oCanvasRect.left, oCropAreaRect.top - oCanvasRect.top, oCropAreaRect.width, oCropAreaRect.height);

		this.rectangleCrop(oCoords.x, oCoords.y, oCoords.width, oCoords.height, bPreview);
	};

	ImageEditor.prototype._rectangleCrop = function(fX, fY, fWidth, fHeight) {
		var oTmpCanvas = document.createElement("canvas");

		oTmpCanvas.width = Math.round(fWidth);
		oTmpCanvas.height = Math.round(fHeight);

		oTmpCanvas.getContext("2d").drawImage(this._oCanvas, fX, fY, fWidth, fHeight, 0, 0, fWidth, fHeight);

		this._drawImage(oTmpCanvas);
		this._refreshCropContainerSize();
	};

	ImageEditor.prototype._applyEllipseCrop = function(bPreview) {
		var oCropAreaRect, oCanvasRect, oCoords;

		oCropAreaRect = this.$().find(".sapSuiteUiCommonsImageEditorCropInnerRectangle")[0].getBoundingClientRect();
		oCanvasRect = this._oCanvas.getBoundingClientRect();
		oCoords = this._transposeViewportCoordsToImageCoords(oCropAreaRect.left - oCanvasRect.left, oCropAreaRect.top - oCanvasRect.top, oCropAreaRect.width, oCropAreaRect.height);

		this.ellipseCrop(oCoords.width / 2 + oCoords.x, oCoords.height / 2 + oCoords.y, oCoords.width / 2, oCoords.height / 2, bPreview);
	};

	ImageEditor.prototype._ellipseCrop = function(fX, fY, fXRadius, fYRadius) {
		var oTmpCanvas = document.createElement("canvas"),
			fRectWidth = fXRadius * 2,
			fRectHeight = fYRadius * 2,
			oContext = oTmpCanvas.getContext("2d");

		oTmpCanvas.width = Math.round(fRectWidth);
		oTmpCanvas.height = Math.round(fRectHeight);

		// apply mask
		// IE doens't support ellipse on canvas
		// https://stackoverflow.com/a/37563530
		if (!oContext.ellipse) {
			oContext.save();
			oContext.translate(fXRadius, fYRadius);
			oContext.scale(fXRadius, fYRadius);
			oContext.arc(0, 0, 1, 0, 360);
			oContext.restore();
		} else {
			oContext.ellipse(fXRadius, fYRadius, fXRadius, fYRadius, 0, 0, 2 * Math.PI);
		}

		oContext.fill();
		oContext.globalCompositeOperation = "source-in"; // MASK MODE
		oContext.drawImage(this._oCanvas, fX - fXRadius, fY - fYRadius, fRectWidth, fRectHeight, 0, 0, fRectWidth, fRectHeight);
		this._drawImage(oTmpCanvas);
		this._refreshCropContainerSize();
	};

	ImageEditor.prototype._applyCustomShapeCrop = function(bPreview) {
		var oCropAreaRect, oCanvasRect, oCoords;

		oCropAreaRect = this.$().find(".sapSuiteUiCommonsImageEditorCropInnerRectangle")[0].getBoundingClientRect();
		oCanvasRect = this._oCanvas.getBoundingClientRect();
		oCoords = this._transposeViewportCoordsToImageCoords(oCropAreaRect.left - oCanvasRect.left, oCropAreaRect.top - oCanvasRect.top, oCropAreaRect.width, oCropAreaRect.height);

		this.customShapeCrop(oCoords.x, oCoords.y, oCoords.width, oCoords.height, bPreview);
	};

	ImageEditor.prototype._customShapeCrop = function(fX, fY, fWidth, fHeight) {
		var oTmpCanvas = document.createElement("canvas"),
			oContext = oTmpCanvas.getContext("2d");

		oTmpCanvas.width = fWidth;
		oTmpCanvas.height = fHeight;

		// apply mask
		oContext.drawImage(this._oCustomShapeImg, 0, 0, fWidth, fHeight);

		oContext.globalCompositeOperation = "source-in"; // MASK MODE
		oContext.drawImage(this._oCanvas, fX, fY, fWidth, fHeight, 0, 0, fWidth, fHeight);
		oContext.globalCompositeOperation = "source-over";

		this._drawImage(oTmpCanvas);
		this._refreshCropContainerSize();
	};

	ImageEditor.prototype._getFinalisedCanvas = function() {
		var iWidth = this.getWidth(),
			iHeight = this.getHeight(),
			oImageData, oTmpCanvas, oContext;

		// Apply all filters on px lvl and render the result to new canvas which can then be downloaded
		oImageData = this._getLastImg().getContext("2d").getImageData(0, 0, iWidth, iHeight);
		this._applyFilterHistory(oImageData);

		oTmpCanvas = document.createElement("canvas");
		oContext = oTmpCanvas.getContext("2d");
		oTmpCanvas.width = iWidth;
		oTmpCanvas.height = iHeight;
		oContext.putImageData(oImageData, 0, 0);

		return oTmpCanvas;
	};

	// this could be ran in webworker, just to be sure, together with busy indicator for save
	ImageEditor.prototype._applyFilterHistory = function(oImageData) {
		var oFilter;

		for (var i = this._aHistory.length - 1; i >= this._iHistoryIndex; i--) {
			if (this._aHistory[i].isA("sap.suite.ui.commons.imageeditor.FilterHistoryItem")) {
				oFilter = this._aHistory[i];
				FilterUtils[oFilter.getType()](oImageData, oFilter.getValue() / 100);
			}
		}
	};

	ImageEditor.prototype._applyFilterItem = function(oFilterItem) {
		var oImg = this._getLastImg(),
			oContext = oImg.getContext("2d"),
			oImageData = oContext.getImageData(0, 0, oImg.width, oImg.height);
		FilterUtils[oFilterItem.getType()](oImageData, oFilterItem.getValue() / 100);
		this._oContext.putImageData(oImageData, 0, 0);
	};


	// as optimalization, filters are done by css 'filter' property
	// and are applied to the actual pixels of the image on save via the methods in FilterUtils
	// this doesn't work in IE which obviously doesn't support css filters; in IE, the slow filters are applied immediately
	ImageEditor.prototype._updateFilters = function() {
		var sFilters = "",
			oHistoryItem;

		function createFilterString(oFilterData) {
			return oFilterData.getType() + "(" + oFilterData.getValue() + oFilterData.getUnit() + ") ";
		}

		if (this._needsManualFilter()) {
			if (this._isReady()) {
				if (this._oPreview && this._oPreview.isA("sap.suite.ui.commons.imageeditor.FilterHistoryItem")) {
					this._applyFilterItem(this._oPreview);
				}
			}
		} else {
			for (var i = this._aHistory.length - 1; i >= this._iHistoryIndex; i--) {
				oHistoryItem = this._aHistory[i];

				if (oHistoryItem.isA("sap.suite.ui.commons.imageeditor.FilterHistoryItem")) {
					sFilters += createFilterString(oHistoryItem);
				}
			}

			if (this._oPreview && this._oPreview.isA("sap.suite.ui.commons.imageeditor.FilterHistoryItem")) {
				sFilters += createFilterString(this._oPreview);
			}

			this._oCanvas.style.filter = sFilters.trim();
		}
	};

	ImageEditor.prototype._needsManualFilter = function() {
		// IE doesn't support css filters
		// on iphone, browser crashes when bigger photo is used and filter is applied with css

		return Device.browser.msie || Device.os.name === Device.os.OS.IOS;
	};

	ImageEditor.prototype._isMobileSafari = function() {
		return Device.os.name === Device.os.OS.IOS && Device.browser.name === Device.browser.BROWSER.SAFARI;
	};

	ImageEditor.prototype._reset = function() {
		// settings that are not part of API properties
		this.$().addClass("sapSuiteUiCommonsImageEditorEmpty");
		this._aHistory = [];
		this._iHistoryIndex = 0;
		this._oPreview = null;
		this._bImageLoaded = false;
		this._oCropArea = null;
		this._oCanvas.width = 0;
		this._oCanvas.height = 0;
		this._oOriginalBlob = null;
		this._sOriginalFileName = null;
		this._sOriginalFileType = null;
		this._iExifRotation = null;
		this._bExifFlip = false;

		this._updateFilters();
		this._refreshContainerSize();
	};

	ImageEditor.prototype._drawImage = function(oSourceImg) {
		var mSize = this._limitCanvasSize(oSourceImg.width, oSourceImg.height);

		this._oCanvas.width = mSize.width;
		this._oCanvas.height = mSize.height;

		this._oContext.drawImage(oSourceImg, 0, 0, oSourceImg.width, oSourceImg.height, 0, 0, this._oCanvas.width, this._oCanvas.height);
		this._refreshContainerSize();
	};

	// canvas size is limited, unfortunately the maximum depends on each browser implementation and cannot be found programatically easily
	// https://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element
	// this function limits the maximum canvas size based on the constants that can are different for each platform
	ImageEditor.prototype._limitCanvasSize = function(iWidth, iHeight, bSuppressMessage) {
		var iMaximum = this._isMobileSafari() ? ImageEditor.LIMITS.MAX_SAFARI_MOBILE_CANVAS_SIZE : ImageEditor.LIMITS.MAX_CANVAS_SIZE,
			iNewWidth = iWidth,
			iNewHeight = iHeight,
			fCoef;

		if (iWidth * iHeight > iMaximum) {
			fCoef = Math.sqrt(iMaximum / (iWidth * iHeight));
			iNewWidth = Math.floor(iWidth * fCoef); // use floor instead of round to prevent rounding errors that would cause overflow of the maximum size
			iNewHeight = Math.floor(iNewHeight * iNewWidth / iWidth);

			if (!bSuppressMessage) {
				this.fireSizeChanged({
					width: iNewWidth,
					height: iNewHeight,
					originalWidth: iWidth,
					originalHeight: iHeight
				});

				MessageToast.show(oResourceBundle.getText("IMGEDITOR_SCALE_WARNING", [iNewWidth, iNewHeight, iWidth, iHeight]), {
					duration: 6000
				});
			}
		}

		return {
			width: iNewWidth,
			height: iNewHeight
		};
	};

	ImageEditor.prototype._degToRad = function(fDeg) {
		return fDeg * Math.PI / 180;
	};

	ImageEditor.prototype._RadToDeg = function(fRad) {
		return fRad * 180 / Math.PI;
	};


	ImageEditor.prototype._getCropAreaDragIcon = function() {
		if (!this._cropAreaDragIcon) {
			this._cropAreaDragIcon = new Icon({
				src: "sap-icon://move",
				useIconTooltip: false
			});
		}
		return this._cropAreaDragIcon;
	};

	return ImageEditor;

});
