sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/suite/ui/commons/library",
	"sap/ui/core/library",
	"sap/m/library",
	"./ImageEditor",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbarToggleButton",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/ToggleButton",
	"sap/m/ToolbarSeparator",
	"sap/m/ToolbarSpacer",
	"sap/m/Label",
	"sap/m/Slider",
	"sap/m/Input",
	"sap/m/CheckBox",
	"sap/ui/model/json/JSONModel",
	"sap/m/MenuButton",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Select",
	"sap/m/Button",
	"sap/ui/core/Item",
	"sap/m/ResponsivePopover",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/CustomListItem",
	"sap/m/FlexBox",
	"sap/m/FlexItemData",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/ui/core/Icon",
	"sap/ui/core/HTML",
	"sap/m/Switch",
	"sap/suite/ui/commons/ControlProxy",
	"sap/base/Log",
	"sap/ui/unified/FileUploader",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/ResizeHandler",
	"./ImageEditorContainerRenderer" // renderer has to be imported in every control now
], function(jQuery, Control, library, CoreLibrary, MobileLibrary, ImageEditor, OverflowToolbar, OverflowToolbarButton,
			OverflowToolbarToggleButton, OverflowToolbarLayoutData, ToggleButton, ToolbarSeparator, ToolbarSpacer, Label, Slider, Input, CheckBox,
			JSONModel, MenuButton, SegmentedButton, SegmentedButtonItem, Select, Button, Item, ResponsivePopover, List,
			StandardListItem, CustomListItem, FlexBox, FlexItemData, IconTabBar, IconTabFilter, Icon, HTML, Switch, ControlProxy,
			Log, FileUploader, ManagedObjectObserver, ResizeHandler) {
	"use strict";

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	var InputType = MobileLibrary.InputType,
		ListType = MobileLibrary.ListType,
		ImageEditorMode = library.ImageEditorMode,
		ImageEditorContainerMode = library.ImageEditorContainerMode,
		ImageEditorContainerButton = library.ImageEditorContainerButton,
		ValueState = CoreLibrary.ValueState,
		ListMode = MobileLibrary.ListMode,
		ButtonType = MobileLibrary.ButtonType,
		FlexDirection = MobileLibrary.FlexDirection,
		FlexRendertype = MobileLibrary.FlexRendertype,
		FlexJustifyContent = MobileLibrary.FlexJustifyContent,
		FlexAlignItems = MobileLibrary.FlexAlignItems,
		IconTabDensityMode = MobileLibrary.IconTabDensityMode,
		BackgroundDesign = MobileLibrary.BackgroundDesign,
		SwitchType = MobileLibrary.SwitchType,
		TextAlign = CoreLibrary.TextAlign,
		mNumberInputHandlers = Object.freeze({
			WIDTH: {min: ImageEditor.LIMITS.WIDTH_MIN, max: ImageEditor.LIMITS.WIDTH_MAX, callback: "_setWidth"},
			HEIGHT: {min: ImageEditor.LIMITS.HEIGHT_MIN, max: ImageEditor.LIMITS.HEIGHT_MAX, callback: "_setHeight"},
			ROTATION: {min: ImageEditor.LIMITS.ROTATION_MIN, max: ImageEditor.LIMITS.ROTATION_MAX, callback: "_rotate"},
			FILTER: {callback: "_applyCurrentFilter"}
		}),
		mIcons = Object.freeze({
			CUSTOMSIZE: "sap-icon://write-new-document",
			ORIGINALSIZE: "sap-icon://table-view",
			ROTATELEFT: "sap-icon://response",
			ROTATERIGHT: "sap-icon://forward",
			CROPRECTANGLE: "sap-icon://color-fill",
			CROPELLIPSE: "sap-icon://circle-task-2",
			CROPCUSTOMSHAPE: "sap-icon://add-favorite",
			TRANSFORM: "sap-icon://draw-rectangle",
			FILTER: "sap-icon://palette",
			CROP: "sap-icon://crop",
			UNDO: "sap-icon://undo",
			DROPDOWN: "sap-icon://slim-arrow-down",
			ZONES: "sap-icon://tag",
			LOCK: "sap-icon://locked",
			RESET: "sap-icon://reset",
			FLIPVERTICAL: "sap-icon://resize-vertical",
			FLIPHORIZONTAL: "sap-icon://resize-horizontal",
			RELATIVE: "sap-icon://resize",
			ZOOMIN: "sap-icon://zoom-in",
			ZOOMOUT: "sap-icon://zoom-out",
			ZOOMFIT: "sap-icon://popup-window"
		});

	/**
	 * Constructor for a new ImageEditorContainer.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control acts as a wrapper around the {@link sap.suite.ui.commons.imageeditor.ImageEditor} control.
	 * It provides additional image editing capabilities for the convenience of your users.
	 *
	 * <h3>Toolbar Customization</h3>
	 * There are two ways to customize the toolbar, but they cannot be used together:
	 * <ul>
	 * <li>Use <code>enabledButtons<code> property to select the order and visibility of the buttons provided by the <code>ImageEditorContainer</code> control.
	 * You can use the <code>customToolbarControls</code> aggregation to add custom controls that will be rendered in the toolbar.</li>
	 * <li>Use the {@link #getToolbar} method together with the {@link #getToolbarIds} method to customize the toolbar as you need.
	 * <br>The changes made to the toolbar will be kept unless some of the methods from previous approach are used. The previous approach involves rerendering of the toolbar, which causes all changes to be lost.
	 * <b>Note:</b> If you use this approach, make sure that you make your changes to the mobile toolbars as well, so that your application can be used on mobile devices.
	 * <br>There are three mobile toolbars available:
	 * <ul>
	 * <li>The header toolbar that can be customized using the method {@link #getMobileHeaderToolbar} and is intended for custom buttons.</li>
	 * <li>The zoom toolbar contains zoom functionality that can be customized using the methods {@link #getMobileZoomToolbar} and {@link #getMobileZoomToolbarIds}.</li>
	 * <li>The footer toolbar that usually includes the <code>ImageEditorContainer</code> buttons and can be customized using the methods {@link #getMobileFooterToolbar} and {@link #getMobileFooterToolbarIds}.</li>
	 * </ul></li>
	 * </ul>
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
	 * @alias sap.suite.ui.commons.imageeditor.ImageEditorContainer
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var ImageEditorContainer = Control.extend("sap.suite.ui.commons.imageeditor.ImageEditorContainer", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				* Image editor container mode.
				* <br>Three modes are available: transform mode, crop mode, and filter mode (default).
				* <br>The default mode provides filters for image editing: brightness, contrast, saturation, sepia
				* grayscale, and others.
				*/
				mode: {type: "sap.suite.ui.commons.ImageEditorContainerMode", defaultValue: ImageEditorContainerMode.Filter},
				/**
				 * Controls order and availability of the buttons in the header panel of ImageEditorContainer.
				 */
				enabledButtons: {
					type: "sap.suite.ui.commons.ImageEditorContainerButton[]",
					defaultValue: [ImageEditorContainerButton.Filter, ImageEditorContainerButton.Transform, ImageEditorContainerButton.Crop]
				}
			},

			defaultAggregation: "imageEditor",
			aggregations: {
				/**
			 	* {@link sap.suite.ui.commons.imageeditor.ImageEditor} containing the image for editing.
				* <br>If no {@link sap.suite.ui.commons.imageeditor.ImageEditor} is specified, the <code>ImageEditorContainer</code>
				* has no effect.
			 	*/
				imageEditor: {
					type: "sap.suite.ui.commons.imageeditor.ImageEditor", multiple: false, singularName: "imageEditor"
				},
				/**
				 * Custom controls that are added into the toolbar of <code>ImageEditorContainer</code>.
				 * Only use controls that are supported by {@link sap.m.OverflowToolbar}.
				 */
				customToolbarControls: {
					type: "sap.ui.core.Control", multiple: true, singularName: "customToolbarControl"
				},
				/**
				 * Custom items for Resize option panel.
				 */
				customResizeItems: {
					type: "sap.suite.ui.commons.imageeditor.CustomSizeItem", multiple: true, singularName: "customResizeItem"
				},
				/**
				 * Custom items for Rectangle Crop option panel.
				 */
				customRectangleCropItems: {
					type: "sap.suite.ui.commons.imageeditor.CustomSizeItem", multiple: true, singularName: "customRectangleCropItem"
				},
				/**
				 * Custom items for Ellipse Crop option panel.
				 */
				customEllipseCropItems: {
					type: "sap.suite.ui.commons.imageeditor.CustomSizeItem", multiple: true, singularName: "customEllipseCropItem"
				}
			}
		}
	});

	var CONSTANTS = Object.freeze({
		// how many default items should be kept in options panel before custom items are added
		NUM_KEPT_ITEMS: 2
	});

	/* =========================================================== */
	/* Life cycle methods											*/
	/* =========================================================== */
	ImageEditorContainer.prototype.init = function() {
		var oSettings = {
			enabled: false,
			mode: null,
			zoom: 100,
			transform: {
				keepAspectRatio: true,
				width: null,
				height: null,
				widthValueState: ValueState.None,
				widthValueStateText: null,
				heightValueState: ValueState.None,
				heightValueStateText: null,
				rotate: 0,
				rotateValueState: ValueState.None,
				rotateValueStateText: null,
				selectedTypeKey: "Resize",
				flipVertical: false,
				flipHorizontal: false,
				resizes: [
					{
						key: "custom",
						text: oResourceBundle.getText("IMGEDITOR_CUSTOM_SIZE"),
						icon: mIcons.CUSTOMSIZE,
						unlockRatio: true
					},
					{
						key: "original",
						text: oResourceBundle.getText("IMGEDITOR_ORIGINAL_SIZE"),
						icon: mIcons.ORIGINALSIZE
					}
				],
				rotates: [
					{
						key: "90left",
						text: oResourceBundle.getText("IMGEDITOR_ROTATE_90LEFT"),
						rotate: -90,
						icon: mIcons.ROTATELEFT
					},
					{
						key: "90right",
						text: oResourceBundle.getText("IMGEDITOR_ROTATE_90RIGHT"),
						rotate: 90,
						icon: mIcons.ROTATERIGHT
					},
					{
						key: "45left",
						text: oResourceBundle.getText("IMGEDITOR_ROTATE_45LEFT"),
						rotate: -45,
						icon: mIcons.ROTATELEFT
					},
					{
						key: "45right",
						text: oResourceBundle.getText("IMGEDITOR_ROTATE_45RIGHT"),
						rotate: 45,
						icon: mIcons.ROTATERIGHT
					}
				],
				flips: [
					{
						key: "vertical",
						text: oResourceBundle.getText("IMGEDITOR_FLIP_VERTICAL"),
						icon: mIcons.FLIPVERTICAL,
						flipVertical: true,
						flipHorizontal: false
					},
					{
						key: "horizontal",
						text: oResourceBundle.getText("IMGEDITOR_FLIP_HORIZONTAL"),
						icon: mIcons.FLIPHORIZONTAL,
						flipVertical: false,
						flipHorizontal: true
					}
				]
			},
			crop: {
				scaleCropArea: false,
				customShapeLoaded: false,
				zoom: 100,
				zoomValueState: ValueState.None,
				zoomValueStateText: null,
				width: null,
				widthValueState: ValueState.None,
				widthValueStateText: null,
				height: null,
				heightValueState: ValueState.None,
				heightValueStateText: null,
				keepAspectRatio: true,
				selectedTypeKey: "Rectangle",
				selectedType: null,
				enabled: true,
				areaRectangle: {
					x: 10,
					y: 10,
					width: 80,
					height: 80
				},
				types: [
					{
						key: "Rectangle",
						text: "\ue17b",
						icon: mIcons.CROPRECTANGLE,
						apply: "applyVisibleCrop"
					},
					{
						key: "Ellipse",
						text: "\ue255",
						icon: mIcons.CROPELLIPSE,
						apply: "applyVisibleCrop"
					},
					{
						key: "CustomShape",
						text: "\ue057",
						icon: mIcons.CROPCUSTOMSHAPE,
						apply: "applyVisibleCrop"
					}
				],
				ratiosRectangle: [
					{
						key: "custom",
						text: oResourceBundle.getText("IMGEDITOR_CUSTOM_SIZE"),
						icon: mIcons.CUSTOMSIZE,
						unlockRatio: true,
						relative: true
					},
					{
						key: "original",
						text: oResourceBundle.getText("IMGEDITOR_CROP_RATIO_ORIGINAL"),
						width: null,
						height: null,
						icon: mIcons.ORIGINALSIZE,
						relative: true
					}
				],
				ratiosCircle: [
					{
						key: "custom",
						text: oResourceBundle.getText("IMGEDITOR_CUSTOM_SIZE"),
						icon: mIcons.CUSTOMSIZE,
						unlockRatio: true,
						relative: true
					},
					{
						key: "original",
						text: oResourceBundle.getText("IMGEDITOR_CROP_RATIO_ORIGINAL"),
						width: null,
						height: null,
						icon: mIcons.ORIGINALSIZE,
						relative: true
					}
				],
				ratiosCustomShape: [
					{
						key: "custom",
						text: oResourceBundle.getText("IMGEDITOR_CUSTOM_SIZE"),
						icon: mIcons.CUSTOMSIZE,
						unlockRatio: true,
						relative: true
					},
					{
						key: "original",
						text: oResourceBundle.getText("IMGEDITOR_CROP_RATIO_ORIGINAL"),
						callback: "_setCustomShapeCropAreaRatio",
						icon: mIcons.ORIGINALSIZE,
						relative: true
					}
				]
			},
			filter: {
				filterValueState: ValueState.None,
				filterValueStateText: null,
				selectedFilter: null,
				filters: [
					{
						text: oResourceBundle.getText("IMGEDITOR_FILTER_BRIGHTNESS"),
						type: "brightness",
						value: 100,
						defaultValue: 100,
						unit: "%",
						min: ImageEditor.LIMITS.BRIGHTNESS_MIN,
						max: ImageEditor.LIMITS.BRIGHTNESS_MAX
					},
					{
						text: oResourceBundle.getText("IMGEDITOR_FILTER_CONTRAST"),
						type: "contrast",
						value: 100,
						defaultValue: 100,
						unit: "%",
						min: ImageEditor.LIMITS.CONTRAST_MIN,
						max: ImageEditor.LIMITS.CONTRAST_MAX
					},
					{
						text: oResourceBundle.getText("IMGEDITOR_FILTER_SATURATION"),
						type: "saturate",
						value: 100,
						defaultValue: 100,
						unit: "%",
						min: ImageEditor.LIMITS.SATURATE_MIN,
						max: ImageEditor.LIMITS.SATURATE_MAX
					},
					{
						text: oResourceBundle.getText("IMGEDITOR_FILTER_GRAYSCALE"),
						type: "grayscale",
						value: 0,
						defaultValue: 0,
						unit: "%",
						min: ImageEditor.LIMITS.GRAYSCALE_MIN,
						max: ImageEditor.LIMITS.GRAYSCALE_MAX
					},
					{
						text: oResourceBundle.getText("IMGEDITOR_FILTER_INVERT"),
						type: "invert",
						value: 0,
						defaultValue: 0,
						unit: "%",
						min: ImageEditor.LIMITS.INVERT_MIN,
						max: ImageEditor.LIMITS.INVERT_MAX
					},
					{
						text: oResourceBundle.getText("IMGEDITOR_FILTER_SEPIA"),
						type: "sepia",
						value: 0,
						defaultValue: 0,
						unit: "%",
						min: ImageEditor.LIMITS.SEPIA_MIN,
						max: ImageEditor.LIMITS.SEPIA_MAX
					}
				]
			},
			history: [],
			historyIndex: 0
		};

		this._bFirstTimeRendered = true;

		this._oObserver = new ManagedObjectObserver(this._onManagedObjectChange.bind(this));
		this._oObserver.observe(this, {properties: ["enabledButtons"], aggregations: ["customToolbarControls"]});

		this._oModel = new JSONModel(oSettings);
		this._oThumbnailCanvas = document.createElement("canvas");
		this._updateToolbarsContent();
		this["_setMode" + this.getMode()]();
	};

	ImageEditorContainer.prototype.onBeforeRendering = function() {
		if (this._sResizeHandlerId) {
			ResizeHandler.deregister(this._sResizeHandlerId);
		}
	};

	ImageEditorContainer.prototype.onAfterRendering = function() {
		var that = this;

		this._bIsSmallSize = this._isSmallSize();

		function onThemeChanged() {
			sap.ui.getCore().detachThemeChanged(onThemeChanged);
			that._zoomToFit();
		}

		if (this._bFirstTimeRendered && this.getImageEditor()) {
			this._bFirstTimeRendered = false;

			if (sap.ui.getCore().isThemeApplied()) {
				this._zoomToFit();
			} else {
				sap.ui.getCore().attachThemeChanged(onThemeChanged);
			}
		}

		this._sResizeHandlerId = ResizeHandler.register(this, this._onResize.bind(this));
	};

	ImageEditorContainer.prototype.onExit = function() {
		if (this._sResizeHandlerId) {
			ResizeHandler.deregister(this._sResizeHandlerId);
		}
	};

	ImageEditorContainer.prototype._onResize = function() {
		// ControlProxy used to render customToolbarControls to two different toolbars renders controls with same id
		// two controls rendered in the page with same id can cause problem (e.g. for file uploader)
		// that is why we need only one of the toolbars (mobile/non-mobile) rendered at a time
		// we need to rerender control every time it goes from/to mobile size
		var bIsSmallSize = this._isSmallSize();

		if (this._bIsSmallSize !== bIsSmallSize) {
			this._bIsSmallSize = bIsSmallSize;
			this.rerender();
		}
	};

	ImageEditorContainer.prototype._isSmallSize = function() {
		var iSmallSize = (sap.m.ScreenSizes && sap.m.ScreenSizes.table) || 600;

		return this.$()[0] && this.$().width() < iSmallSize;
	};

	ImageEditorContainer.prototype._zoomToFit = function() {
		var oImageEditor = this.getImageEditor();

		if (oImageEditor && oImageEditor._isReady() && this.getDomRef()) {
			oImageEditor.zoomToFit();
			this._oModel.setProperty("/zoom", oImageEditor.getZoomLevel());
			this._refreshCropAreaSize();
		}
	};


		ImageEditorContainer.prototype.exit = function() {
		this._oObserver.disconnect();
		this._oObserver.destroy();
	};

	/* =========================================================== */
	/* Properties												   */
	/* =========================================================== */

	ImageEditorContainer.prototype.setMode = function(sMode) {
		this.setProperty("mode", sMode, true);

		this["_setMode" + this.getMode()]();

		return this;
	};

	ImageEditorContainer.prototype.setImageEditor = function(oImageEditor) {
		// dettach events from the last image editor if there is some
		this._detachEditorEvents(this.getImageEditor());
		this.setAggregation("imageEditor", oImageEditor);
		this._attachEditorEvents(oImageEditor);

		if (oImageEditor && oImageEditor.getLoaded()) {
			this._onImageLoaded();
		}

		if (oImageEditor && oImageEditor.getCustomShapeLoaded()) {
			this._onCustomShapeLoaded();
		}

		return this;
	};

	ImageEditorContainer.prototype.destroyImageEditor = function() {
		// dettach events from the last image editor if there is some
		this._detachEditorEvents(this.getImageEditor());
		this.destroyAggregation("imageEditor");
		this._oModel.setProperty("/enabled", false);

		return this;
	};

	/* =========================================================== */
	/* Public API 											   */
	/* =========================================================== */

	/**
	 * Returns the header toolbar of the <code>ImageEditorContainer</code> for customization of its content.
	 *
	 * @return {sap.m.OverflowToolbar} Header toolbar
	 * @public
	 */
	ImageEditorContainer.prototype.getToolbar = function() {
		return this._getHeaderToolbar();
	};

	/**
	 * Returns IDs of the default items in the header toolbar. Can be used for toolbar customization.
	 *
	 * @return {{filter: string, crop: string, transform: string, undo: string, history: string, zoomIn: string, zoomOut: string, zoomToFit: string, zoomLabel: string, separator: string}} Ids of the default items in the header toolbar
	 * @public
	 */
	ImageEditorContainer.prototype.getToolbarIds = function() {
		return {
			filter: this.getId() + "-filterButton",
			crop: this.getId() + "-cropButton",
			transform: this.getId() + "-transformButton",
			undo: this.getId() + "-undoButton",
			history: this.getId() + "-historyButton",
			zoomIn: this.getId() + "-zoominButton",
			zoomOut: this.getId() + "-zoomoutButton",
			zoomToFit: this.getId() + "-zoomToFitButton",
			zoomLabel: this.getId() + "-zoomLabel",
			separator: this.getId() + "-separator"
		};
	};

	/**
	 * Returns the mobile header toolbar of the <code>ImageEditorContainer</code> for customization of its content.
	 *
	 * @return {sap.m.OverflowToolbar} Mobile header toolbar
	 * @public
	 */
	ImageEditorContainer.prototype.getMobileHeaderToolbar = function() {
		return this._getMobileHeaderToolbar();
	};

	/**
	 * Returns the mobile zoom toolbar of the <code>ImageEditorContainer</code> for customization of its content.
	 *
	 * @return {sap.m.OverflowToolbar} Mobile zoom toolbar
	 * @since 1.68
	 * @public
	 */
	ImageEditorContainer.prototype.getMobileZoomToolbar = function() {
		return this._getMobileZoomToolbar();
	};

	/**
	 * Returns IDs of the default items in the mobile zoom toolbar. Can be used for toolbar customization.
	 *
	 * @return {{zoomIn: string, zoomOut: string, zoomToFit: string, zoomLabel: string, scaleSwitch: string, scaleLabel: string}} IDs of the default items in the header toolbar
	 * @since 1.68
	 * @public
	 */
	ImageEditorContainer.prototype.getMobileZoomToolbarIds = function() {
		return {
			zoomIn: this.getId() + "-mobileZoominButton",
			zoomLabel: this.getId() + "-mobileZoomLabel",
			zoomOut: this.getId() + "-mobilezoomoutButton",
			zoomToFit: this.getId() + "-mobileZoomToFitButton",
			scaleSwitch: this.getId() + "-mobileScaleSwitch",
			scaleLabel: this.getId() + "-mobileScaleLabel"
		};
	};

	/**
	 * Returns the mobile footer toolbar of the <code>ImageEditorContainer</code> for customization of its content.
	 *
	 * @return {sap.m.OverflowToolbar} Mobile footer toolbar
	 * @public
	 */
	ImageEditorContainer.prototype.getMobileFooterToolbar = function() {
		return this._getMobileFooterToolbar();
	};

	/**
	 * Returns IDs of the default items in the mobile footer toolbar. Can be used for toolbar customization.
	 *
	 * @return {{filter: string, crop: string, transform: string, undo: string, history: string, apply: string}} IDs of the default items in the header toolbar
	 * @public
	 */
	ImageEditorContainer.prototype.getMobileFooterToolbarIds = function() {
		return {
			filter: this.getId() + "-mobileFilterButton",
			crop: this.getId() + "-mobileCropButton",
			transform: this.getId() + "-mobileTransformButton",
			undo: this.getId() + "-mobileUndoButton",
			history: this.getId() + "-mobileHistoryButton",
			apply: this.getId() + "-mobileApplyButton"
		};
	};

	/* =========================================================== */
	/* Private methods											   */
	/* =========================================================== */

	ImageEditorContainer.prototype._attachEditorEvents = function(oImageEditor) {
		if (!oImageEditor) {
			return;
		}

		oImageEditor.attachLoaded(this._onImageLoaded, this);
		oImageEditor.attachCustomShapeLoaded(this._onCustomShapeLoaded, this);
		oImageEditor.attachError(this._onImageError, this);
		oImageEditor.attachCropAreaChanged(this._onCropAreaChange, this);
		oImageEditor.attachHistoryChanged(this._onHistoryChange, this);
		oImageEditor.attachSizeChanged(this._onSizeChange, this);
		oImageEditor.attachZoomChanged(this._onZoomChange, this);
	};

	ImageEditorContainer.prototype._detachEditorEvents = function(oImageEditor) {
		if (!oImageEditor) {
			return;
		}

		oImageEditor.detachLoaded(this._onImageLoaded, this);
		oImageEditor.detachCustomShapeLoaded(this._onCustomShapeLoaded, this);
		oImageEditor.detachError(this._onImageError, this);
		oImageEditor.detachCropAreaChanged(this._onCropAreaChange, this);
		oImageEditor.detachHistoryChanged(this._onHistoryChange, this);
		oImageEditor.detachSizeChanged(this._onSizeChange, this);
		oImageEditor.detachZoomChanged(this._onZoomChange, this);
	};

	ImageEditorContainer.prototype._onManagedObjectChange = function(oChanges) {
		if (oChanges.object === this._oMobileHeaderToolbar) {
			this._oMobileHeaderToolbar.setVisible(oChanges.object.getContent().length > 0);
		} else if (oChanges.object === this) {
			this._updateToolbarsContent();
		}
	};

	ImageEditorContainer.prototype._refreshImageSize = function() {
		if (!this.getImageEditor() || !this.getImageEditor().getLoaded()) {
			return;
		}

		var iWidth = this.getImageEditor().getWidth(),
			iHeight = this.getImageEditor().getHeight();

		this._oModel.setProperty("/transform/resizes/1/width", iWidth);
		this._oModel.setProperty("/transform/resizes/1/height", iHeight);
		this._oModel.setProperty("/crop/ratiosRectangle/1/width", iWidth);
		this._oModel.setProperty("/crop/ratiosRectangle/1/height", iHeight);
		this._oModel.setProperty("/crop/ratiosCircle/1/width", iWidth);
		this._oModel.setProperty("/crop/ratiosCircle/1/height", iHeight);
		this._updateCurrentSize(iWidth, iHeight);
	};

	ImageEditorContainer.prototype._refreshCropAreaSize = function() {
		var oCropArea = this.getImageEditor().getCropArea();

		if (!oCropArea) {
			return;
		}

		this._updateCropSize(Math.round(oCropArea.width), Math.round(oCropArea.height));
	};

	ImageEditorContainer.prototype._onImageLoaded = function() {
		var oImageEditor = this.getImageEditor();

		this._resetValueStates();
		this._oModel.setProperty("/enabled", !!oImageEditor.getSrc());

		if (!oImageEditor.getSrc()) {
			this._changeOptionsPanelContent();
			return;
		}

		this["_setMode" + this.getMode()]();
		this._refreshImageSize();
		this._oModel.setProperty("/history", []);
		this._oModel.setProperty("/historyIndex", 0);
		this._zoomToFit();

		this._updateOrigThumbnail();
		this._resetCurrentPanel();
	};

	ImageEditorContainer.prototype._onCustomShapeLoaded = function() {
		var oImageEditor = this.getImageEditor();

		if (oImageEditor.getCustomShapeSrc() && oImageEditor.getLoaded() && oImageEditor.getMode() === ImageEditorMode.CropCustomShape) {
			this._setCustomShapeCropAreaRatio();
		}
		this._oModel.setProperty("/crop/customShapeLoaded", !!oImageEditor.getCustomShapeSrc());
	};

	ImageEditorContainer.prototype._onImageError = function() {
		this._resetValueStates();
		this._changeOptionsPanelContent();
		this._oModel.setProperty("/enabled", false);
	};

	ImageEditorContainer.prototype._onCropAreaChange = function(oEvent) {
		this._resetValueStates();
		this._updateCropSize(Math.round(oEvent.getParameter("cropArea").width), Math.round(oEvent.getParameter("cropArea").height));
	};

	ImageEditorContainer.prototype._onHistoryChange = function(oEvent) {
		var aHistory = oEvent.getParameter("history"),
			iHistoryIndex = oEvent.getParameter("index");

		this._resetValueStates();
		this._refreshImageSize();
		aHistory.push({noChange: "NoChange"});
		this._oModel.setProperty("/history", aHistory);
		this._oModel.setProperty("/historyIndex", iHistoryIndex);
	};

	ImageEditorContainer.prototype._onSizeChange = function(oEvent) {
		this._resetValueStates();
		this._updateCurrentSize(oEvent.getParameter("width"), oEvent.getParameter("height"));
		this._selectResizeCustomSizeItem(this.getImageEditor().getKeepResizeAspectRatio());
	};

	ImageEditorContainer.prototype._onZoomChange = function(oEvent) {
		var iZoom = oEvent.getParameter("zoom");

		this._oModel.setProperty("/zoom", iZoom);
		this._refreshCropAreaSize();
	};

	ImageEditorContainer.prototype._updateCropSize = function(iWidth, iHeight) {
		this._oModel.setProperty("/crop/width", iWidth);
		this._oModel.setProperty("/crop/height", iHeight);
	};

	ImageEditorContainer.prototype._updateCurrentSize = function(iWidth, iHeight) {
		this._oModel.setProperty("/transform/width", iWidth);
		this._oModel.setProperty("/transform/height", iHeight);
	};

	ImageEditorContainer.prototype._updateOrigThumbnail = function() {
		// create small thumbnail of the original image from image editor and use it in filter items
		var oThumb = this.$("origThumbnail"),
			oImageEditor = this.getImageEditor(),
			iWidth, iHeight,
			oContext = this._oThumbnailCanvas.getContext("2d");

		if (oImageEditor.getWidth() >= oImageEditor.getHeight()) {
			iWidth = 300;
			iHeight = Math.round(oImageEditor.getHeight() * iWidth / oImageEditor.getWidth());
		} else {
			iHeight = 300;
			iWidth = Math.round(oImageEditor.getWidth() * iHeight / oImageEditor.getHeight());
		}

		this._oThumbnailCanvas.width = iWidth;
		this._oThumbnailCanvas.height = iHeight;
		oContext.clearRect(0, 0, iWidth, iHeight);
		oContext.drawImage(oImageEditor._oCanvas, 0, 0, iWidth, iHeight);

		oThumb.attr({
			"href": this._oThumbnailCanvas.toDataURL()
		});

		// jquery attr changes viewBox to viewbox, use setAttribute instead
		if (oThumb[0]) {
			oThumb[0].setAttribute("viewBox", "0 0 " + iWidth + " " + iHeight);
		}
	};

	ImageEditorContainer.prototype._getHeaderToolbar = function() {
		if (!this._oHeaderToolbar) {
			this._oHeaderToolbar = new OverflowToolbar({
				enabled: "{/enabled}"
			}).addStyleClass("sapSuiteUiCommonsImageEditorContainerHeaderToolbar");
			this._oHeaderToolbar.setModel(this._oModel);
			this.addDependent(this._oHeaderToolbar);
		}

		return this._oHeaderToolbar;
	};

	ImageEditorContainer.prototype._updateToolbarsContent = function() {
		var oHeaderToolbar = this._getHeaderToolbar(),
			oMobileHeaderToolbar = this._getMobileHeaderToolbar(),
			oMobileFooterToolbar = this._getMobileFooterToolbar(),
			aEnabledButtons = this.getEnabledButtons(),
			i;

		oHeaderToolbar.removeAllContent();
		oMobileHeaderToolbar.removeAllContent();
		oMobileFooterToolbar.removeAllContent();

		this._getHistoryItems().forEach(function(oItem) {
			oHeaderToolbar.addContent(oItem);
		});

		this._getMobileHistoryItems().forEach(function(oItem) {
			oMobileFooterToolbar.addContent(oItem);
		});

		this._getZoomItems().forEach(function(oItem) {
			oHeaderToolbar.addContent(oItem);
		});

		oHeaderToolbar.addContent(this._getToolbarSeparator());

		for (i = 0; i < aEnabledButtons.length; i++) {
			switch (aEnabledButtons[i]) {
				case ImageEditorContainerButton.Filter: {
					oHeaderToolbar.addContent(this._getFilterButton());
					oMobileFooterToolbar.addContent(this._getMobileFilterButton());
					break;
				}
				case ImageEditorContainerButton.Crop: {
					oHeaderToolbar.addContent(this._getCropButton());
					oMobileFooterToolbar.addContent(this._getMobileCropButton());
					break;
				}
				case ImageEditorContainerButton.Transform: {
					oHeaderToolbar.addContent(this._getTransformButton());
					oMobileFooterToolbar.addContent(this._getMobileTransformButton());
					break;
				}
				case ImageEditorContainerButton.History: {
					break;
				}
				default:
					break;
			}
		}

		oHeaderToolbar.addContent(this._getToolbarSpacer());

		oMobileFooterToolbar.addContent(this._getMobileFooterToolbarSpacer());
		oMobileFooterToolbar.addContent(this._getMobileApplyButton());

		if (this.getCustomToolbarControls().length > 0) {
			oMobileHeaderToolbar.addContent(this._getMobileHeaderToolbarSpacer());
		}

		this.getCustomToolbarControls().forEach(function(oControl) {
			var oProxy = new ControlProxy(),
				oMobileProxy = new ControlProxy();

			this.addDependent(oProxy);
			oProxy.setAssociation("control", oControl);
			oHeaderToolbar.addContent(oProxy);

			this.addDependent(oMobileProxy);
			oMobileProxy.setAssociation("control", oControl);
			oMobileHeaderToolbar.addContent(oMobileProxy);
		}, this);
	};

	ImageEditorContainer.prototype._getToolbarSpacer = function() {
		if (!this._oSpacer) {
			this._oSpacer = new ToolbarSpacer({
				id: this.getId() + "-spacer"
			});
			this.addDependent(this._oSpacer);
		}

		return this._oSpacer;
	};

	ImageEditorContainer.prototype._getMobileHeaderToolbarSpacer = function() {
		if (!this._oMobileHeaderSpacer) {
			this._oMobileHeaderSpacer = new ToolbarSpacer({
				id: this.getId() + "-mobileSpacer"
			});
			this.addDependent(this._oMobileHeaderSpacer);
		}

		return this._oMobileHeaderSpacer;
	};

	ImageEditorContainer.prototype._getMobileFooterToolbarSpacer = function() {
		if (!this._oMobileFooterSpacer) {
			this._oMobileFooterSpacer = new ToolbarSpacer({
				id: this.getId() + "-mobileFooterSpacer"
			});
			this.addDependent(this._oMobileFooterSpacer);
		}

		return this._oMobileFooterSpacer;
	};

	ImageEditorContainer.prototype._getMobileHeaderToolbar = function() {
		if (!this._oMobileHeaderToolbar) {
			this._oMobileHeaderToolbar = new OverflowToolbar({
				enabled: "{/enabled}",
				visible: false
			}).addStyleClass("sapSuiteUiCommonsImageEditorContainerMobileToolbar");
			this.addDependent(this._oMobileHeaderToolbar);

			this._oObserver.observe(this._oMobileHeaderToolbar, {aggregations: ["content"]});
		}

		return this._oMobileHeaderToolbar;
	};

	ImageEditorContainer.prototype._getMobileZoomToolbar = function() {
		if (!this._oMobileZoomToolbar) {
			this._oMobileZoomToolbar = new OverflowToolbar({
				enabled: "{/enabled}",
				content: [
					this._getMobileZoomInButton(),
					this._getMobileZoomLabel(),
					this._getMobileZoomOutButton(),
					this._getMobileZoomToFitButton(),
					this._getMobileScaleSwitch(),
					this._getMobileScaleLabel()
				]
			}).addStyleClass("sapSuiteUiCommonsImageEditorContainerMobileToolbar");
			this._oMobileZoomToolbar.setModel(this._oModel);
			this.addDependent(this._oMobileZoomToolbar);
		}

		return this._oMobileZoomToolbar;
	};

	ImageEditorContainer.prototype._getMobileFooterToolbar = function() {
		if (!this._oMobileFooterToolbar) {
			this._oMobileFooterToolbar = new OverflowToolbar({
				enabled: "{/enabled}"
			}).addStyleClass("sapSuiteUiCommonsImageEditorContainerMobileToolbar");
			this._oMobileFooterToolbar.setModel(this._oModel);
			this.addDependent(this._oMobileFooterToolbar);

			// force footer bar look
			if (this._oMobileFooterToolbar._applyContextClassFor) {
				this._oMobileFooterToolbar._applyContextClassFor("footer");
			} else {
				Log.warning("ImageEditorContainer: _applyContextClassFor method doesn't exist, footer look is not applied on mobile footer toolbar");
			}
		}

		return this._oMobileFooterToolbar;
	};

	ImageEditorContainer.prototype._getHistoryPopover = function() {
		var that = this;

		if (!this._oHistoryPopover) {
			this._oHistoryPopover = new ResponsivePopover({
				title: {
					path: "/history",
					formatter: function(aHistory) {
						return oResourceBundle.getText("IMGEDITOR_HISTORY_TITLE", String(aHistory.length - 1)); // without String, number 0 isn't taken as value
					}
				},
				endButton: new Button({
					text: oResourceBundle.getText("IMGEDITOR_HISTORY_CLOSE"),
					press: function() {
						that._oHistoryPopover.close();
					}
				}),
				afterOpen: function() {
					var iHistoryIndex = that._oModel.getProperty("/historyIndex"),
						oItem = that._oHistoryList.getItems()[iHistoryIndex];

					that._oHistoryList.setSelectedItem(oItem);
					oItem.focus(); // scroll to selected item after opening
				}
			});

			this._oHistoryList = new List({
				mode: ListMode.SingleSelectMaster,
				selectionChange: function(oEvent) {
					var oSelectedItem = oEvent.getParameter("listItem"),
						iIndex = oSelectedItem.getParent().indexOfItem(oSelectedItem);

					that._jumpToHistory(iIndex);
				},
				items: {
					path: "/history",
					factory: this._historyItemFactory.bind(this)
				}
			});

			this._oHistoryPopover.setModel(this._oModel);
			this._oHistoryPopover.addContent(this._oHistoryList);

			this.addDependent(this._oHistoryPopover);
		}

		return this._oHistoryPopover;
	};

	ImageEditorContainer.prototype._historyItemFactory = function(sId, oContext) {
		var iCurrentIndex = this._oModel.getProperty("/history").indexOf(oContext.getProperty()),
			oHistoryItem = oContext.getProperty(),
			oItem, sTitle, sDescription, sIcon;

		switch (oHistoryItem.noChange || oHistoryItem.getMetadata().getName()) {
			case "sap.suite.ui.commons.imageeditor.RotateHistoryItem": {
				sTitle = oResourceBundle.getText("IMGEDITOR_ROTATE");
				sDescription = oHistoryItem.getDegrees();
				sIcon = mIcons.TRANSFORM;
				break;
			}
			case "sap.suite.ui.commons.imageeditor.ResizeHistoryItem": {
				sTitle = oResourceBundle.getText("IMGEDITOR_RESIZE");
				sDescription = oResourceBundle.getText("IMGEDITOR_HISTORY_TEXT",
					[oHistoryItem.getOldWidth() + " x " + oHistoryItem.getOldHeight(), oHistoryItem.getWidth() + " x " + oHistoryItem.getHeight()]);
				sIcon = mIcons.TRANSFORM;
				break;
			}
			case "sap.suite.ui.commons.imageeditor.FlipHistoryItem": {
				sTitle = oResourceBundle.getText("IMGEDITOR_FLIP");
				if (oHistoryItem.getVertical() && oHistoryItem.getHorizontal()) {
					sDescription = oResourceBundle.getText("IMGEDITOR_FLIP_BOTH");
					sIcon = mIcons.FLIPHORIZONTAL;
				} else {
					sDescription = oHistoryItem.getVertical() ? oResourceBundle.getText("IMGEDITOR_FLIP_VERTICAL") : oResourceBundle.getText("IMGEDITOR_FLIP_HORIZONTAL");
					sIcon = oHistoryItem.getVertical() ? mIcons.FLIPVERTICAL : mIcons.FLIPHORIZONTAL;
				}
				break;
			}
			case "sap.suite.ui.commons.imageeditor.FilterHistoryItem": {
				sTitle = oHistoryItem.getType();
				sTitle = sTitle[0].toUpperCase() + sTitle.slice(1);
				sDescription = oHistoryItem.getValue();
				sIcon = mIcons.FILTER;
				break;
			}
			case "sap.suite.ui.commons.imageeditor.CropRectangleHistoryItem":
			case "sap.suite.ui.commons.imageeditor.CropEllipseHistoryItem":
			case "sap.suite.ui.commons.imageeditor.CropCustomShapeHistoryItem": {
				sTitle = oResourceBundle.getText("IMGEDITOR_CROP");
				sDescription = oResourceBundle.getText("IMGEDITOR_HISTORY_TEXT",
					[oHistoryItem.getOldWidth() + " x " + oHistoryItem.getOldHeight(), oHistoryItem.getWidth() + " x " + oHistoryItem.getHeight()]);
				sIcon = mIcons.CROP;
				break;
			}
			case "NoChange": {
				sTitle = oResourceBundle.getText("IMGEDITOR_HISTORY_ORIGINAL");
				sDescription = oResourceBundle.getText("IMGEDITOR_HISTORY_ORIGINAL_TEXT");
				sIcon = mIcons.RESET;
				break;
			}
			default: {
				break;
			}
		}

		oItem = new StandardListItem({
			title: sTitle,
			description: sDescription,
			icon: sIcon,
			selected: {
				path: "/historyIndex",
				formatter: function(iHistoryIndex) {
					return iCurrentIndex === iHistoryIndex;
				}
			}
		});

		return oItem;
	};

	ImageEditorContainer.prototype._getHistoryItems = function() {
		if (!this._aHistoryItems) {
			this._aHistoryItems = [
				this._getUndoButton(),
				this._getHistoryArrowButton()
			];
		}

		return this._aHistoryItems;
	};

	ImageEditorContainer.prototype._getMobileHistoryItems = function() {
		if (!this._aMobileHistoryItems) {
			this._aMobileHistoryItems = [
				this._getMobileUndoButton(),
				this._getMobileHistoryArrowButton()
			];
		}

		return this._aMobileHistoryItems;
	};

	ImageEditorContainer.prototype._getUndoButton = function() {
		if (!this._oHistoryButton) {
			this._oHistoryButton = this._createUndoButton(this.getId() + "-undoButton");
			this.addDependent(this._oHistoryButton);
		}

		return this._oHistoryButton;
	};

	ImageEditorContainer.prototype._getMobileUndoButton = function() {
		if (!this._oMobileHistoryButton) {
			this._oMobileHistoryButton = this._createUndoButton(this.getId() + "-mobileUndoButton");
			this.addDependent(this._oMobileHistoryButton);
		}

		return this._oMobileHistoryButton;
	};

	ImageEditorContainer.prototype._createUndoButton = function(sId) {
		var that = this;

		return new OverflowToolbarButton({
			id: sId,
			type: ButtonType.Transparent,
			icon: mIcons.UNDO,
			enabled: {
				parts: ["/history", "/historyIndex"],
				formatter: function(aHistory, iHistoryIndex) {
					return aHistory.length > 1 && iHistoryIndex < aHistory.length - 1;
				}
			},
			press: function() {
				that._undo();
			},
			tooltip: oResourceBundle.getText("IMGEDITOR_PANEL_UNDO")
		});
	};

	ImageEditorContainer.prototype._getHistoryArrowButton = function() {
		var that = this;

		if (!this._oHistoryArrowButton) {
			this._oHistoryArrowButton = this._createHistoryArrowButton(
				this.getId() + "-historyButton",
				function() {
					that._resetValueStates();
					that._getHistoryPopover().openBy(that._oHistoryArrowButton);
				}
			);
			this.addDependent(this._oHistoryArrowButton);
		}

		return this._oHistoryArrowButton;
	};

	ImageEditorContainer.prototype._getMobileHistoryArrowButton = function() {
		var that = this;

		if (!this._oMobileHistoryArrowButton) {
			this._oMobileHistoryArrowButton = this._createHistoryArrowButton(
				this.getId() + "-mobileHistoryButton",
				function() {
					that._resetValueStates();
					that._getHistoryPopover().openBy(that._oMobileHistoryArrowButton);
				}
			);
			this.addDependent(this._oMobileHistoryArrowButton);
		}

		return this._oMobileHistoryArrowButton;
	};

	ImageEditorContainer.prototype._createHistoryArrowButton = function(sId, fnOnPress) {
		return new OverflowToolbarButton({
			id: sId,
			type: ButtonType.Transparent,
			icon: mIcons.DROPDOWN,
			enabled: {
				path: "/history",
				formatter: function(aHistory) {
					return aHistory.length > 1;
				}
			},
			press: fnOnPress,
			tooltip: oResourceBundle.getText("IMGEDITOR_PANEL_HISTORY")
		});
	};

	ImageEditorContainer.prototype._getZoomItems = function() {
		if (!this._aZoomItems) {
			this._aZoomItems = [
				this._getZoomInButton(),
				this._getZoomLabel(),
				this._getZoomOutButton(),
				this._getZoomToFitButton()
			];
		}

		return this._aZoomItems;
	};

	ImageEditorContainer.prototype._getZoomInButton = function() {
		if (!this._oZoomInButton) {
			this._oZoomInButton = this._createZoomInButton(this.getId() + "-zoominButton");
			this.addDependent(this._oZoomInButton);
		}

		return this._oZoomInButton;
	};

	ImageEditorContainer.prototype._getMobileZoomInButton = function() {
		if (!this._oMobileZoomInButton) {
			this._oMobileZoomInButton = this._createZoomInButton(this.getId() + "-mobileZoominButton");
			this.addDependent(this._oMobileZoomInButton);
		}

		return this._oMobileZoomInButton;
	};

	ImageEditorContainer.prototype._createZoomInButton = function(sId) {
		var that = this;

		return new OverflowToolbarButton({
			id: sId,
			type: ButtonType.Transparent,
			icon: mIcons.ZOOMIN,
			press: function() {
				var oImageEditor = that.getImageEditor();
				oImageEditor.zoomIn();
				that._oModel.setProperty("/zoom", oImageEditor.getZoomLevel());
				that._refreshCropAreaSize();
			},
			tooltip: oResourceBundle.getText("IMGEDITOR_PANEL_ZOOMIN")
		});
	};

	ImageEditorContainer.prototype._getZoomLabel = function() {
		if (!this._oZoomLabel) {
			this._oZoomLabel = this._createZoomLabel(this.getId() + "-zoomLabel");
			this.addDependent(this._oZoomLabel);
		}

		return this._oZoomLabel;
	};

	ImageEditorContainer.prototype._getMobileZoomLabel = function() {
		if (!this._oMobileZoomLabel) {
			this._oMobileZoomLabel = this._createZoomLabel(this.getId() + "-mobileZoomLabel");
			this.addDependent(this._oMobileZoomLabel);
		}

		return this._oMobileZoomLabel;
	};

	ImageEditorContainer.prototype._createZoomLabel = function(sId) {
		return new Label({
			id: sId,
			text: {
				path: "/zoom",
				formatter: function(iZoom) {
					return iZoom + "%";
				}
			}
		});
	};

	ImageEditorContainer.prototype._getZoomOutButton = function() {
		if (!this._oZoomOutButton) {
			this._oZoomOutButton = this._createZoomOutButton(this.getId() + "-zoomoutButton");
			this.addDependent(this._oZoomOutButton);
		}

		return this._oZoomOutButton;
	};

	ImageEditorContainer.prototype._getMobileZoomOutButton = function() {
		if (!this._oMobileZoomOutButton) {
			this._oMobileZoomOutButton = this._createZoomOutButton(this.getId() + "-mobileZoomoutButton");
			this.addDependent(this._oMobileZoomOutButton);
		}

		return this._oMobileZoomOutButton;
	};

	ImageEditorContainer.prototype._createZoomOutButton = function(sId) {
		var that = this;

		return new OverflowToolbarButton({
			id: sId,
			type: ButtonType.Transparent,
			icon: mIcons.ZOOMOUT,
			press: function() {
				var oImageEditor = that.getImageEditor();
				oImageEditor.zoomOut();
				that._oModel.setProperty("/zoom", oImageEditor.getZoomLevel());
				that._refreshCropAreaSize();
			},
			tooltip: oResourceBundle.getText("IMGEDITOR_PANEL_ZOOMOUT")
		});
	};

	ImageEditorContainer.prototype._getZoomToFitButton = function() {
		if (!this._oZoomToFit) {
			this._oZoomToFit = this._createZoomToFitButton(this.getId() + "-zoomToFitButton");
			this.addDependent(this._oZoomToFit);
		}

		return this._oZoomToFit;
	};

	ImageEditorContainer.prototype._getMobileZoomToFitButton = function() {
		if (!this._oMobileZoomToFit) {
			this._oMobileZoomToFit = this._createZoomToFitButton(this.getId() + "-mobileZoomToFitButton");
			this.addDependent(this._oMobileZoomToFit);
		}

		return this._oMobileZoomToFit;
	};

	ImageEditorContainer.prototype._createZoomToFitButton = function(sId) {
		var that = this;

		return new OverflowToolbarButton({
			id: sId,
			type: ButtonType.Transparent,
			icon: mIcons.ZOOMFIT,
			press: that._zoomToFit.bind(that),
			tooltip: oResourceBundle.getText("IMGEDITOR_PANEL_ZOOMTOFIT")
		});
	};

	ImageEditorContainer.prototype._getScaleSwitch = function() {
		if (!this._oScaleSwitch) {
			this._oScaleSwitch = this._createScaleSwitch(this.getId() + "-scaleSwitch");
			this.addDependent(this._oScaleSwitch);
		}

		return this._oScaleSwitch;
	};

	ImageEditorContainer.prototype._getMobileScaleSwitch = function() {
		if (!this._oMobileScaleSwitch) {
			this._oMobileScaleSwitch = this._createScaleSwitch(this.getId() + "-mobileScaleSwitch");
			this.addDependent(this._oMobileScaleSwitch);
		}

		return this._oMobileScaleSwitch;
	};

	ImageEditorContainer.prototype._createScaleSwitch = function(sId) {
		var that = this;

		return new Switch({
			id: sId,
			type: SwitchType.AcceptReject,
			state: "{/crop/scaleCropArea}",
			visible: {
				path: "/mode",
				formatter: function(sMode) {
					return sMode === "Crop";
				}
			},
			change: function(oEvent) {
				that._setScaleCropArea(oEvent.getParameter("state"));
			}
		}).addStyleClass("sapUiTinyMarginEnd");
	};

	ImageEditorContainer.prototype._getScaleLabel = function() {
		if (!this._oScaleLabel) {
			this._oScaleLabel = this._createScaleLabel(this.getId() + "-scaleLabel");
			this.addDependent(this._oScaleLabel);
		}

		return this._oScaleLabel;
	};

	ImageEditorContainer.prototype._getMobileScaleLabel = function() {
		if (!this._oMobileScaleLabel) {
			this._oMobileScaleLabel = this._createScaleLabel(this.getId() + "-mobileScaleLabel");
			this.addDependent(this._oMobileScaleLabel);
		}

		return this._oMobileScaleLabel;
	};


	ImageEditorContainer.prototype._createScaleLabel = function(sLabelFor) {
		return new Label({
			text: oResourceBundle.getText("IMGEDITOR_CROP_SCALE"),
			labelFor: sLabelFor,
			visible: {
				path: "/mode",
				formatter: function(sMode) {
					return sMode === "Crop";
				}
			}
		});
	};

	ImageEditorContainer.prototype._getToolbarSeparator = function() {
		if (!this._oSeparator) {
			this._oSeparator = 	new ToolbarSeparator({
				id: this.getId() + "-separator"
			});
			this.addDependent(this._oSeparator);
		}

		return this._oSeparator;
	};

	ImageEditorContainer.prototype._getTransformButton = function() {
		if (!this._oTransformButton) {
			this._oTransformButton = this._createTransformButton(this.getId() + "-transformButton");
			this.addDependent(this._oTransformButton);
		}

		return this._oTransformButton;
	};

	ImageEditorContainer.prototype._getMobileTransformButton = function() {
		if (!this._oMobileTransformButton) {
			this._oMobileTransformButton = this._createTransformButton(this.getId() + "-mobileTransformButton");
			this.addDependent(this._oMobileTransformButton);
		}

		return this._oMobileTransformButton;
	};

	ImageEditorContainer.prototype._createTransformButton = function(sId) {
		return new OverflowToolbarToggleButton({
			id: sId,
			icon: mIcons.TRANSFORM,
			type: ButtonType.Transparent,
			pressed: {
				path: "/mode",
				formatter: function(sMode) {
					return sMode === ImageEditorContainerMode.Transform;
				}
			},
			enabled: {
				path: "/mode",
				formatter: function(sMode) {
					return sMode !== ImageEditorContainerMode.Transform;
				}
			},
			press: this._onButtonPress.bind(this, this._setModeTransform.bind(this)),
			tooltip: oResourceBundle.getText("IMGEDITOR_PANEL_TRANSFORM")
		});
	};

	ImageEditorContainer.prototype._getCropButton = function() {
		if (!this._oCropButton) {
			this._oCropButton = this._createCropButton(this.getId() + "-cropButton");
			this.addDependent(this._oCropButton);
		}

		return this._oCropButton;
	};

	ImageEditorContainer.prototype._getMobileCropButton = function() {
		if (!this._oMobileCropButton) {
			this._oMobileCropButton = this._createCropButton(this.getId() + "-mobileCropButton");
			this.addDependent(this._oMobileCropButton);
		}

		return this._oMobileCropButton;
	};

	ImageEditorContainer.prototype._createCropButton = function(sId) {
		return new OverflowToolbarToggleButton({
			id: sId,
			icon: mIcons.CROP,
			type: ButtonType.Transparent,
			pressed: {
				path: "/mode",
				formatter: function(sMode) {
					return sMode === ImageEditorContainerMode.Crop;
				}
			},
			enabled: {
				path: "/mode",
				formatter: function(sMode) {
					return sMode !== ImageEditorContainerMode.Crop;
				}
			},
			press: this._onButtonPress.bind(this, this._setModeCrop.bind(this)),
			tooltip: oResourceBundle.getText("IMGEDITOR_PANEL_CROP")
		});
	};

	ImageEditorContainer.prototype._getFilterButton = function() {
		if (!this._oFilterButton) {
			this._oFilterButton = this._createFilterButton(this.getId() + "-filterButton");
			this.addDependent(this._oFilterButton);
		}

		return this._oFilterButton;
	};

	ImageEditorContainer.prototype._getMobileFilterButton = function() {
		if (!this._oMobileFilterButton) {
			this._oMobileFilterButton = this._createFilterButton(this.getId() + "-mobileFilterButton");
			this.addDependent(this._oMobileFilterButton);
		}

		return this._oMobileFilterButton;
	};

	ImageEditorContainer.prototype._createFilterButton = function(sId) {
		return new OverflowToolbarToggleButton({
			id: sId,
			icon: mIcons.FILTER,
			type: ButtonType.Transparent,
			pressed: {
				path: "/mode",
				formatter: function(sMode) {
					return sMode === ImageEditorContainerMode.Filter;
				}
			},
			enabled: {
				path: "/mode",
				formatter: function(sMode) {
					return sMode !== ImageEditorContainerMode.Filter;
				}
			},
			press: this._onButtonPress.bind(this, this._setModeFilter.bind(this)),
			tooltip: oResourceBundle.getText("IMGEDITOR_PANEL_FILTER")
		});
	};

	ImageEditorContainer.prototype._getMobileApplyButton = function() {
		if (!this._oMobileApplyButton) {
			this._oMobileApplyButton = new Button({
				id: this.getId() + "-mobileApplyButton",
				text: oResourceBundle.getText("IMGEDITOR_APPLY"),
				type: ButtonType.Emphasized,
				press: this._applyPreview.bind(this)
			});
		}

		return this._oMobileApplyButton;
	};

	ImageEditorContainer.prototype._changeOptionsPanelContent = function(fnGetPanelContent) {
		var oOptionsPanel = this._getOptionsPanel();

		oOptionsPanel.removeAllItems();

		if (!this.getImageEditor() || !this.getImageEditor().getLoaded() || !fnGetPanelContent) {
			return;
		}

		fnGetPanelContent().forEach(function(oContent) {
			oOptionsPanel.addItem(oContent);
		});
	};

	ImageEditorContainer.prototype._onButtonPress = function(fnHandler) {
		this.getImageEditor()._cancelPreview();
		fnHandler();
	};

	ImageEditorContainer.prototype._setModeTransform = function(sKey) {
		this._changeOptionsPanelContent(this._getTransformPanelContent.bind(this));

		if (this.getImageEditor()) {
			this.getImageEditor().setMode(ImageEditorMode.Resize);
		}

		if (this.getMode() !== ImageEditorContainerMode.Transform) {
			this.setProperty("mode", ImageEditorContainerMode.Transform, true);
		}

		this._setTransformTypeByKey(sKey || "Resize");
		this._oModel.setProperty("/mode", ImageEditorContainerMode.Transform);
	};

	ImageEditorContainer.prototype._setModeCrop = function(sKey) {
		this._changeOptionsPanelContent(this._getCropPanelContent.bind(this));

		if (this.getImageEditor()) {
			this._setCropTypeByKey(sKey || "Rectangle");
		}

		if (this.getMode() !== ImageEditorContainerMode.Crop) {
			this.setProperty("mode", ImageEditorContainerMode.Crop, true);
		}

		this._oModel.setProperty("/mode", ImageEditorContainerMode.Crop);
		this._setScaleCropArea(this._oModel.getProperty("/crop/scaleCropArea"));
	};

	ImageEditorContainer.prototype._setModeFilter = function() {
		this._changeOptionsPanelContent(this._getFilterPanelContent.bind(this));

		if (this.getImageEditor()) {
			this.getImageEditor().setMode(ImageEditorMode.Default);
		}

		if (this.getMode() !== ImageEditorContainerMode.Filter) {
			this.setProperty("mode", ImageEditorContainerMode.Filter, true);
		}

		this._resetFilterValues();
		this._selectFilterItem(0);
		this._oModel.setProperty("/mode", ImageEditorContainerMode.Filter);
	};

	ImageEditorContainer.prototype._constraintValue = function(iVal, oLimits, oSource) {
		var oValueBinding = oSource.getBinding("value"),
			oValueStateBinding = oSource.getBinding("valueState"),
			oValueStateTextBinding = oSource.getBinding("valueStateText"),
			sWarning;

		if (isNaN(iVal) || iVal < oLimits.min || iVal > oLimits.max) {
			sWarning = oResourceBundle.getText("IMGEDITOR_BAD_NUMBER", [oLimits.min, oLimits.max]);
			iVal = this._oModel.getProperty(oValueBinding.getPath());
		}

		if (sWarning) {
			this._oModel.setProperty(oValueStateBinding.getPath(), ValueState.Warning);
			this._oModel.setProperty(oValueStateTextBinding.getPath(), sWarning);
		}

		this._oModel.setProperty(oValueBinding.getPath(), iVal); // this doesn't trigger update on the control if the model value isn't changed
		oSource.setValue(iVal); // force the value back into source control

		return iVal;
	};

	ImageEditorContainer.prototype._onNumberInputChange = function(mProperties, oEvent) {
		var vVal = oEvent.getParameter("value"),
			vNewVal = oEvent.getParameter("newValue"),
			iVal;

		this._resetValueStates();

		if (typeof vVal === "number") {
			iVal = vVal;
		} else if (typeof vNewVal === "number") {
			iVal = vNewVal;
		} else {
			iVal = parseInt(oEvent.getParameter("value") || oEvent.getParameter("newValue"), 10);
		}

		iVal = this._constraintValue(iVal, mProperties, oEvent.getSource());
		this[mProperties.callback](iVal);
	};

	ImageEditorContainer.prototype._setRatio = function(iWidth, iHeight) {
		if (!this.getImageEditor() || !this.getImageEditor().getLoaded()) {
			return;
		}

		this.getImageEditor().setCropAreaByRatio(iWidth, iHeight);
		this._refreshCropAreaSize();
	};

	ImageEditorContainer.prototype._setCropAreaBySize = function(iWidth, iHeight) {
		this.getImageEditor().setCropAreaBySize(iWidth, iHeight);
		this._refreshCropAreaSize();
	};

	ImageEditorContainer.prototype._setRatioByKey = function(sKey) {
		if (sKey === "Rectangle") {
			this._setRatio(this._oModel.getProperty("/crop/ratiosRectangle/1/width"), this._oModel.getProperty("/crop/ratiosRectangle/1/height"));
		} else if (sKey === "Ellipse") {
			this._setRatio(1, 1);
		} else if (sKey === "CustomShape" && this.getImageEditor().getCustomShapeLoaded()) {
			this._setCustomShapeCropAreaRatio();
		}
	};

	ImageEditorContainer.prototype._setCustomShapeCropAreaRatio = function() {
		this.getImageEditor().setCustomShapeCropAreaRatio();
		this._refreshCropAreaSize();
	};

	ImageEditorContainer.prototype._setTransformTypeByKey = function(sKey) {
		var sMode = sKey === "Resize" ? ImageEditorMode.Resize : ImageEditorMode.Default;

		if (sKey === "Resize") {
			this._refreshImageSize();
			this._selectResizeCustomSizeItem();
		} else if (sKey === "Rotate") {
			this._oModel.setProperty("/transform/rotate", 0);
		} else if (sKey === "Flip") {
			this._resetFlips();
		}

		this._oModel.setProperty("/transform/selectedTypeKey", sKey);
		this._resetValueStates();

		if (this.getImageEditor()) {
			this.getImageEditor()._cancelPreview();
			this.getImageEditor().setMode(sMode);
		}
	};

	ImageEditorContainer.prototype._setCropTypeByKey = function(sKey, bKeepAspectRatio) {
		var oSelectedType = this._oModel.getProperty("/crop/types").filter(function(oType) { // find method is not supported in ie, using filter instead
			return oType.key === sKey;
		})[0];

		this._setRatioByKey(sKey);
		this._oModel.setProperty("/crop/selectedTypeKey", sKey);
		this._oModel.setProperty("/crop/selectedType", oSelectedType);

		if (this["_select" + sKey + "CropCustomSizeItem"]) {
			this["_select" + sKey + "CropCustomSizeItem"](bKeepAspectRatio);
		}

		this.getImageEditor().setMode("Crop" + sKey);
		this._resetValueStates();
	};

	ImageEditorContainer.prototype._resetCurrentPanel = function() {
		this.getImageEditor().cancelPreview();

		switch (this.getMode()) {
			case ImageEditorContainerMode.Transform: {
				this._setTransformTypeByKey(this._oModel.getProperty("/transform/selectedTypeKey"));
				break;
			}
			case ImageEditorContainerMode.Crop: {
				this._setCropTypeByKey(this._oModel.getProperty("/crop/selectedTypeKey"));
				break;
			}
			case ImageEditorContainerMode.Filter: {
				this._selectFilterItem(this._getSelectedFilterIndex());
				break;
			}
			default:
				break;
		}

		this._resetValueStates();
	};

	ImageEditorContainer.prototype._undo = function() {
		this.getImageEditor().undo();
		this._resetCurrentPanel();
	};

	ImageEditorContainer.prototype._redo = function() {
		this.getImageEditor().redo();
		this._resetCurrentPanel();
	};

	ImageEditorContainer.prototype._jumpToHistory = function(iIndex) {
		this.getImageEditor().jumpToHistory(iIndex);
		this._resetCurrentPanel();
	};

	ImageEditorContainer.prototype._setZoom = function(iZoom) {
		this._oModel.setProperty("/zoom", iZoom);
		this.getImageEditor().zoom(iZoom);
		this._refreshCropAreaSize();
	};

	ImageEditorContainer.prototype._setWidth = function(iWidth) {
		this.getImageEditor().setWidth(iWidth, true);
		// height can be changed by keeping aspect ratio
		this._oModel.setProperty("/transform/height", this.getImageEditor().getPreviewHeight());
		this._selectResizeCustomSizeItem(this.getImageEditor().getKeepResizeAspectRatio());
	};

	ImageEditorContainer.prototype._setHeight = function(iHeight) {
		this.getImageEditor().setHeight(iHeight, true);
		// width can be changed by keeping aspect ratio
		this._oModel.setProperty("/transform/width", this.getImageEditor().getPreviewWidth());
		this._selectResizeCustomSizeItem(this.getImageEditor().getKeepResizeAspectRatio());
	};

	ImageEditorContainer.prototype._setSize = function(iWidth, iHeight, bRelative) {
		if (bRelative) {
			iWidth = this.getImageEditor().getWidth() * iWidth;
			iHeight = this.getImageEditor().getHeight() * iHeight;
		}

		this._updateCurrentSize(iWidth, iHeight);

		// don't do anything if there is no change (pointless history record)
		if (this.getImageEditor().getPreviewWidth() === iWidth && this.getImageEditor().getPreviewHeight() === iHeight) {
			return;
		}
		this.getImageEditor().setSize(iWidth, iHeight, true);
	};

	ImageEditorContainer.prototype._rotate = function(iDegrees) {
		iDegrees = iDegrees > ImageEditor.LIMITS.ROTATION_MAX ? ImageEditor.LIMITS.ROTATION_MAX : iDegrees;
		iDegrees = iDegrees < ImageEditor.LIMITS.ROTATION_MIN ? ImageEditor.LIMITS.ROTATION_MIN : iDegrees;

		this._oModel.setProperty("/transform/rotate", iDegrees);
		this.getImageEditor().rotate(iDegrees, true);
	};

	ImageEditorContainer.prototype._flip = function(bFlipVertical, bFlipHorizontal) {
		this.getImageEditor().flip(bFlipVertical, bFlipHorizontal, true);
	};


	ImageEditorContainer.prototype._setKeepResizeAspectRatio = function(bKeepAspectRatio) {
		this._oModel.setProperty("/transform/keepAspectRatio", bKeepAspectRatio);

		if (this.getImageEditor()) {
			this.getImageEditor().setKeepResizeAspectRatio(bKeepAspectRatio);
		}
	};

	ImageEditorContainer.prototype._getKeepCropAspectRatio = function() {
		return this._oModel.getProperty("/crop/keepAspectRatio");
	};

	ImageEditorContainer.prototype._setKeepCropAspectRatio = function(bKeepAspectRatio) {
		this._oModel.setProperty("/crop/keepAspectRatio", bKeepAspectRatio);

		if (this.getImageEditor()) {
			this.getImageEditor().setKeepCropAspectRatio(bKeepAspectRatio);
		}
	};

	ImageEditorContainer.prototype._setScaleCropArea = function(bScaleCropArea) {
		this._oModel.setProperty("/crop/scaleCropArea", bScaleCropArea);

		if (this.getImageEditor()) {
			this.getImageEditor().setScaleCropArea(bScaleCropArea);
		}
	};

	ImageEditorContainer.prototype._applyCurrentFilter = function(iValue) {
		var oSelectedFilter = this._oModel.getProperty("/filter/selectedFilter");

		if (typeof iValue !== "undefined") {
			this._oModel.setProperty("/filter/selectedFilter/value", iValue);
		}

		this.getImageEditor()[oSelectedFilter.type](oSelectedFilter.value, true);
	};

	ImageEditorContainer.prototype._resetFilterValues = function() {
		var aFilters = this._oModel.getProperty("/filter/filters");

		aFilters.forEach(function(oFilter, iIndex) {
			this._oModel.setProperty("/filter/filters/" + iIndex + "/value", oFilter.defaultValue);
		}, this);
	};

	ImageEditorContainer.prototype._resetValueStates = function() {
		var aPaths = [
			"/transform/widthValueState", "/transform/heightValueState", "/transform/rotateValueState", "/crop/widthValueState", "/crop/heightValueState", "/filter/filterValueState"
		];

		aPaths.forEach(function(sPath) {
			this._oModel.setProperty(sPath, ValueState.None);
		}, this);
	};

	ImageEditorContainer.prototype._resetFlips = function() {
		this._oModel.setProperty("/transform/flipVertical", false);
		this._oModel.setProperty("/transform/flipHorizontal", false);
	};

	ImageEditorContainer.prototype._applyPreview = function() {
		this.getImageEditor().applyPreview();
		this._resetValueStates();

		switch (this.getMode()) {
			case ImageEditorContainerMode.Transform: {
				switch (this._oModel.getProperty("/transform/selectedTypeKey")) {
					case "Resize": {
						this._refreshImageSize();
						break;
					}
					case "Rotate": {
						this._oModel.setProperty("/transform/rotate", 0);
						this._refreshImageSize();
						break;
					}
					case "Flip": {
						this._resetFlips();
						break;
					}
					default:
						break;
				}
				break;
			}
			case ImageEditorContainerMode.Crop: {
				var fnApplyCrop = this._oModel.getProperty("/crop/selectedType/apply");

				if (fnApplyCrop) {
					this.getImageEditor()[fnApplyCrop]();
				}

				this._refreshImageSize();
				this._setRatioByKey(this._oModel.getProperty("/crop/selectedTypeKey"));
				this._deselectCropItem();
				this.getImageEditor().setMode(ImageEditorMode.Default);
				break;
			}
			case ImageEditorContainerMode.Filter: {
				this._resetFilterValues();
				break;
			}
			default:
				break;
		}
	};

	ImageEditorContainer.prototype._createGridList = function(sPath, fnFactory, fnSelectChange) {
		var that = this;

		var oList = new List({
			width: "auto",
			mode: "SingleSelectMaster",
			itemPress: function(oEvent) {
				that._resetValueStates();
				fnSelectChange.call(that, oEvent);
			},
			items: {
				path: sPath,
				factory: fnFactory.bind(this)
			}
		}).addStyleClass("sapSuiteUiCommonsImageEditorContainerGridList");

		oList.setModel(this._oModel);

		// override list item navigation to support 2 columns instead of just one
		if (!oList._oItemNavigation) {
			oList._startItemNavigation();
		}
		// on mobile, navigation doesn't have to exist
		if (oList._oItemNavigation){
			oList._oItemNavigation.setColumns(2);
		}

		return oList;
	};

	ImageEditorContainer.prototype._selectResizeCustomSizeItem = function(bKeepAspectRatio) {
		var oList = this._getResizeGridList(),
			oItem = oList.getItems()[0];

		oList.setSelectedItem(oItem);
		this._setKeepResizeAspectRatio(!!bKeepAspectRatio);
	};

	ImageEditorContainer.prototype._deselectCropItem = function() {
		this._getRectangleCropGridList().removeSelections();
		this._getEllipseCropGridList().removeSelections();
		this._disableCrop();
	};

	ImageEditorContainer.prototype._disableCrop = function() {
		this._oModel.setProperty("/crop/enabled", false);
	};

	ImageEditorContainer.prototype._enableCrop = function() {
		this._oModel.setProperty("/crop/enabled", true);
	};

	ImageEditorContainer.prototype._selectRectangleCropCustomSizeItem = function(bKeepAspectRatio) {
		var oList = this._getRectangleCropGridList(),
			oItem = oList.getItems()[0];

		oList.setSelectedItem(oItem);
		this._setKeepCropAspectRatio(!!bKeepAspectRatio);
		this._enableCrop();
	};

	ImageEditorContainer.prototype._selectEllipseCropCustomSizeItem = function(bKeepAspectRatio) {
		var oList = this._getEllipseCropGridList(),
			oItem = oList.getItems()[0];

		oList.setSelectedItem(oItem);
		this._setKeepCropAspectRatio(!!bKeepAspectRatio);
		this._enableCrop();
	};

	ImageEditorContainer.prototype._selectCustomShapeCropCustomSizeItem = function(bKeepAspectRatio) {
		var oList = this._getCustomShapeCropGridList(),
			oItem = oList.getItems()[0];

		oList.setSelectedItem(oItem);
		this._setKeepCropAspectRatio(!!bKeepAspectRatio);
		this._enableCrop();
	};

	ImageEditorContainer.prototype._selectFilterItem = function(iIndex) {
		var oList = this._getFilterGridList(),
			oItem = oList.getItems()[iIndex];

		this._oModel.setProperty("/filter/selectedFilter", oItem.getBindingContext().getProperty());
		this._oModel.setProperty("/filter/selectedFilter/value", this._oModel.getProperty("/filter/selectedFilter/defaultValue"));
		oList.setSelectedItem(oItem);
	};

	ImageEditorContainer.prototype._getSelectedFilterIndex = function() {
		var oSelectedFilter = this._oModel.getProperty("/filter/selectedFilter"),
			iIndex = oSelectedFilter ? this._oModel.getProperty("/filter/filters").indexOf(oSelectedFilter) : 0;

		return iIndex;
	};

	ImageEditorContainer.prototype._getResizeGridList = function() {
		if (!this._oGridListResize) {
			this._oGridListResize = this._createGridList("/transform/resizes", this._gridRectShapeItemFactory, this._onResizeGridListSelectionChange);
		}

		return this._oGridListResize;
	};

	ImageEditorContainer.prototype._onResizeGridListSelectionChange = function(oEvent) {
		var oItem = oEvent.getParameter("listItem"),
			oContext = oItem.getBindingContext();

		if (oContext.getProperty("width")) {
			this._setSize(oContext.getProperty("width"), oContext.getProperty("height"), oContext.getProperty("relative"));
		}

		this._setKeepResizeAspectRatio(!oContext.getProperty("unlockRatio"));
	};

	ImageEditorContainer.prototype._getRotateGridList = function() {
		if (!this._oGridListRotate) {
			this._oGridListRotate = this._createGridList("/transform/rotates", this._gridRectShapeItemFactory, this._onRotateGridListSelectionChange);
		}

		return this._oGridListRotate;
	};

	ImageEditorContainer.prototype._onRotateGridListSelectionChange = function(oEvent) {
		var oItem = oEvent.getParameter("listItem"),
			oContext = oItem.getBindingContext();

		this._getRotateGridList().removeSelections();
		this._rotate(this._oModel.getProperty("/transform/rotate") + oContext.getProperty("rotate"));
	};

	ImageEditorContainer.prototype._getFlipGridList = function() {
		if (!this._oGridListFlip) {
			this._oGridListFlip = this._createGridList("/transform/flips", this._gridRectShapeItemFactory, this._onFlipGridListSelectionChange);
		}

		return this._oGridListFlip;
	};

	ImageEditorContainer.prototype._onFlipGridListSelectionChange = function(oEvent) {
		var oItem = oEvent.getParameter("listItem"),
			oContext = oItem.getBindingContext(),
			bCurrentFlipVertical = this._oModel.getProperty("/transform/flipVertical"),
			bCurrentFlipHorizontal = this._oModel.getProperty("/transform/flipHorizontal");

		this._getFlipGridList().removeSelections();

		bCurrentFlipVertical = bCurrentFlipVertical !== oContext.getProperty("flipVertical");
		bCurrentFlipHorizontal = bCurrentFlipHorizontal !== oContext.getProperty("flipHorizontal");

		this._oModel.setProperty("/transform/flipVertical", bCurrentFlipVertical);
		this._oModel.setProperty("/transform/flipHorizontal", bCurrentFlipHorizontal);
		this._flip(bCurrentFlipVertical, bCurrentFlipHorizontal);
	};

	ImageEditorContainer.prototype._getRectangleCropGridList = function() {
		if (!this._oGridListRectCrop) {
			this._oGridListRectCrop = this._createGridList("/crop/ratiosRectangle", this._gridRectShapeItemFactory, this._onRectCropGridListSelectionChange);
		}

		return this._oGridListRectCrop;
	};

	ImageEditorContainer.prototype._onRectCropGridListSelectionChange = function(oEvent) {
		var oItem = oEvent.getParameter("listItem");

		this._onGridListSelectionChange(oItem, ImageEditorMode.CropRectangle);
	};

	ImageEditorContainer.prototype._getEllipseCropGridList = function() {
		if (!this._oGridListEllipseCrop) {
			this._oGridListEllipseCrop = this._createGridList("/crop/ratiosCircle", this._gridCircleShapeItemFactory, this._onEllipseCropGridListSelectionChange);
		}

		return this._oGridListEllipseCrop;
	};

	ImageEditorContainer.prototype._onEllipseCropGridListSelectionChange = function(oEvent) {
		var oItem = oEvent.getParameter("listItem");

		this._onGridListSelectionChange(oItem, ImageEditorMode.CropEllipse);
	};

	ImageEditorContainer.prototype._getCustomShapeCropGridList = function() {
		if (!this._oGridListCustomShapeCrop) {
			this._oGridListCustomShapeCrop = this._createGridList("/crop/ratiosCustomShape", this._gridRectShapeItemFactory, this._onCustomShapeCropGridListSelectionChange);
			this._oGridListCustomShapeCrop.setModel(this._oModel);
		}

		return this._oGridListCustomShapeCrop;
	};

	ImageEditorContainer.prototype._onCustomShapeCropGridListSelectionChange = function(oEvent) {
		var oItem = oEvent.getParameter("listItem");

		this._onGridListSelectionChange(oItem, ImageEditorMode.CropCustomShape);
	};

	ImageEditorContainer.prototype._onGridListSelectionChange = function(oItem, sMode) {
		var oContext = oItem.getBindingContext(),
			oImageEditor = this.getImageEditor();

		oImageEditor.setMode(sMode);

		if (oContext.getProperty("callback")) {
			this[oContext.getProperty("callback")]();
		}

		if (oContext.getProperty("width") && oContext.getProperty("relative")) {
			this._setRatio(oContext.getProperty("width"), oContext.getProperty("height"));
		} else if (oContext.getProperty("width") && !oContext.getProperty("relative")) {
			this._setCropAreaBySize(oContext.getProperty("width"), oContext.getProperty("height"));
		}

		this._enableCrop();
		this._setKeepCropAspectRatio(!oContext.getProperty("unlockRatio"));
	};

	ImageEditorContainer.prototype._getFilterGridList = function() {
		if (!this._oGridListFilter) {
			this._oGridListFilter = this._createGridList("/filter/filters", this._gridFilterItemFactory, this._onFilterGridListSelectionChange);
		}

		return this._oGridListFilter;
	};

	ImageEditorContainer.prototype._onFilterGridListSelectionChange = function(oEvent) {
		var oItem = oEvent.getParameter("listItem"),
			oContext = oItem.getBindingContext();

		this._resetFilterValues();
		this._oModel.setProperty("/filter/selectedFilter", oContext.getProperty());
		this.getImageEditor().cancelPreview();
		this.getImageEditor()[oContext.getProperty("type")](oContext.getProperty("value"), true);
	};

	ImageEditorContainer.prototype._gridRectShapeItemFactory = function(sId, oContext) {
		var oContent;

		if (oContext.getProperty("icon")) {
			oContent = new FlexBox({
				renderType: FlexRendertype.Bare,
				alignItems: FlexAlignItems.Center,
				justifyContent: FlexJustifyContent.Center,
				items: [
					new Icon({
						src: "{icon}"
					})
				]
			}).addStyleClass("sapSuiteUiCommonsImageEditorContainerGridItemIcon");
		} else {
			oContent = this._createGridItemRectShape(oContext.getProperty("width"), oContext.getProperty("height"));
		}

		return this._createGridListItem(oContent);
	};

	ImageEditorContainer.prototype._gridCircleShapeItemFactory = function(sId, oContext) {
		var oContent;

		if (oContext.getProperty("icon")) {
			oContent = new FlexBox({
				renderType: FlexRendertype.Bare,
				alignItems: FlexAlignItems.Center,
				justifyContent: FlexJustifyContent.Center,
				items: [
					new Icon({
						src: "{icon}"
					})
				]
			}).addStyleClass("sapSuiteUiCommonsImageEditorContainerGridItemIcon");
		} else {
			oContent = this._createGridItemCircleShape(oContext.getProperty("width"), oContext.getProperty("height"));
		}

		return this._createGridListItem(oContent);
	};

	ImageEditorContainer.prototype._refreshGridListsItems = function() {
		var that = this,
			aGridLists = [
			{path: "/transform/resizes", fnGetItems: this.getCustomResizeItems.bind(this)},
			{path: "/crop/ratiosRectangle", fnGetItems: this.getCustomRectangleCropItems.bind(this)},
			{path: "/crop/ratiosCircle", fnGetItems: this.getCustomEllipseCropItems.bind(this)}
		];

		// force special icon to relative resize items without icon
		this.getCustomResizeItems().forEach(function(oItem) {
			if (oItem.getRelative() && !oItem.getIcon()) {
				oItem.setIcon(mIcons.RELATIVE);
			}
		});

		aGridLists.forEach(function(oGridList) {
			var aResizes = that._oModel.getProperty(oGridList.path),
				aNewResizes = aResizes.slice(0, CONSTANTS.NUM_KEPT_ITEMS);

			oGridList.fnGetItems().forEach(function(oResizeItem) {
				if (oResizeItem.getWidth() > 0 && oResizeItem.getHeight() > 0) {
					aNewResizes.push({
						width: oResizeItem.getWidth(),
						height: oResizeItem.getHeight(),
						text: oResizeItem.getLabel(),
						icon: oResizeItem.getIcon(),
						relative: oResizeItem.getRelative()
					});
				}
			});

			that._oModel.setProperty(oGridList.path, aNewResizes);
		});
	};

	ImageEditorContainer.prototype._createGridListItem = function(oContent) {
		return new CustomListItem({
			type: ListType.Active,
			content: [
				oContent,
				new Label({
					text: "{text}",
					wrapping: false,
					textAlign: TextAlign.Center,
					layoutData: [
						new FlexItemData({
							growFactor: 0, shrinkFactor: 0, baseSize: "auto"
						})
					]
				}).addStyleClass("sapSuiteUiCommonsImageEditorContainerGridItemLabel")
			]
		}).addStyleClass("sapSuiteUiCommonsImageEditorContainerGridItem");
	};

	ImageEditorContainer.prototype._createGridItemRectShape = function(iWidth, iHeight) {
		var oSvg, oRect;
		// adapt the size so that stroke looks good in IE even though it doesn't support 'vector-effect: non-scaling-stroke'
		if (iWidth < 100) {
			iWidth *= 10;
			iHeight *= 10;
		} else if (iWidth > 100) {
			iWidth /= 10;
			iHeight /= 10;
		}

		oSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		// another IE bug, classList.add doesn't work..using setAttribute instead
		oSvg.setAttribute("class", "sapSuiteUiCommonsImageEditorContainerGridItemHeaderContent");
		oSvg.setAttribute("viewBox", "-1 -1 " + (iWidth + 2) + " " + (iHeight + 2)); // accomodate for the stroke width in the viewBox
		oRect = document.createElement("rect");
		oRect.setAttribute("x", "0");
		oRect.setAttribute("y", "0");
		oRect.setAttribute("width", iWidth);
		oRect.setAttribute("height", iHeight);
		oSvg.appendChild(oRect);

		return new HTML({
			content: new XMLSerializer().serializeToString(oSvg) // instead of oSvg.outerHTML because as always, that doesn't work in IE
		});
	};

	ImageEditorContainer.prototype._createGridItemCircleShape = function(iRx, iRy) {
		var oSvg, oRect;
		// adapt the size so that stroke looks good in IE even though it doesn't support 'vector-effect: non-scaling-stroke'
		iRx *= 100;
		iRy *= 100;

		oSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		// another IE bug, classList.add doesn't work..using setAttribute instead
		oSvg.setAttribute("class", "sapSuiteUiCommonsImageEditorContainerGridItemHeaderContent");
		oSvg.setAttribute("viewBox", "-" + (iRx + 2) + " -" + (iRy + 2) + " " + (iRx * 2 + 4) + " " + (iRy * 2 + 4));
		oRect = document.createElement("ellipse");
		oRect.setAttribute("cx", "0");
		oRect.setAttribute("cy", "0");
		oRect.setAttribute("rx", iRx);
		oRect.setAttribute("ry", iRy);
		oSvg.appendChild(oRect);

		return new HTML({
			content: new XMLSerializer().serializeToString(oSvg)
		});
	};

	ImageEditorContainer.prototype._gridFilterItemFactory = function(sId, oContext) {
		var oContent, oSvg, oImage;

		oSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		oSvg.setAttribute("class",
			"sapSuiteUiCommonsImageEditorContainerGridItemHeaderContent sapSuiteUiCommonsImageEditorContainerGridItemHeaderFilterContent");
		oImage = document.createElementNS("http://www.w3.org/2000/svg", "use");
		oImage.setAttribute("href", "#" + this.getId() + "-origThumbnail");
		oImage.setAttribute("filter", "url(#" + this.getId() + "-" + oContext.getProperty("type") + ")");
		oSvg.appendChild(oImage);

		oContent = new HTML({
			content: new XMLSerializer().serializeToString(oSvg) // instead of oSvg.outerHTML because as always, that doesn't work in IE
		});

		return this._createGridListItem(oContent);
	};

	ImageEditorContainer.prototype._getTransformPanelContent = function() {
		var that = this;

		if (!this._oTransformToolbarContent) {
			this._oTransformToolbarContent = [
				new Slider({
					min: ImageEditor.LIMITS.ROTATION_MIN,
					max: ImageEditor.LIMITS.ROTATION_MAX,
					showAdvancedTooltip: true,
					visible: {
						path: "/transform/selectedTypeKey",
						formatter: function(sSelectedTyped) {
							return sSelectedTyped === "Rotate";
						}
					},
					value: {path: "/transform/rotate", mode: "OneWay"},
					liveChange: this._onNumberInputChange.bind(this, mNumberInputHandlers.ROTATION),
					progress: true,
					ariaLabelledBy: [this.getId() + "-transformAngle"]
				}).addStyleClass("sapSuiteUiCommonsImageEditorContainerMobileSlider"),
				new IconTabBar({
					tabDensityMode: IconTabDensityMode.Compact,
					backgroundDesign: BackgroundDesign.Transparent,
					headerBackgroundDesign: BackgroundDesign.Transparent,
					expandable: false,
					select: function(oEvent) {
						var sKey = oEvent.getParameter("key");
						that._setTransformTypeByKey(sKey);
					},
					selectedKey: "{/transform/selectedTypeKey}",
					items: [
						new IconTabFilter({
							key: "Resize",
							text: oResourceBundle.getText("IMGEDITOR_RESIZE"),
							content: [
								this._getResizeGridList(),
								new FlexBox({
									renderType: FlexRendertype.Bare,
									direction: FlexDirection.Column,
									items: [
										new FlexBox({
											renderType: FlexRendertype.Bare,
											justifyContent: FlexJustifyContent.SpaceBetween,
											items: [
												new FlexBox({
													renderType: FlexRendertype.Bare,
													direction: FlexDirection.Column,
													items: [
														new Label({
															text: oResourceBundle.getText("IMGEDITOR_WIDTH"),
															labelFor: this.getId() + "-transformWidth"
														}),
														new Input({
															id: this.getId() + "-transformWidth",
															type: InputType.Number,
															textAlign: TextAlign.Right,
															change: this._onNumberInputChange.bind(this, mNumberInputHandlers.WIDTH),
															value: {
																path: "/transform/width",
																type: "sap.ui.model.type.Integer",
																mode: "OneWay"
															},
															valueState: "{/transform/widthValueState}",
															valueStateText: "{/transform/widthValueStateText}",
															width: "5.9375rem",
															fieldWidth: "4.375rem",
															description: oResourceBundle.getText("IMGEDITOR_PX")
														})
													]
												}),
												new FlexBox({
													renderType: FlexRendertype.Bare,
													direction: FlexDirection.Column,
													justifyContent: FlexJustifyContent.End,
													items: [
														new ToggleButton({
															tooltip: oResourceBundle.getText("IMGEDITOR_LOCK_RATIO"),
															icon: mIcons.LOCK,
															type: ButtonType.Transparent,
															pressed: {path: "/transform/keepAspectRatio"},
															press: function(oEvent) {
																that._resetValueStates();
																that.getImageEditor().setKeepResizeAspectRatio(oEvent.getParameter("pressed"));
																that._selectResizeCustomSizeItem(oEvent.getParameter("pressed"));
															}
														})
													]
												}),
												new FlexBox({
													renderType: FlexRendertype.Bare,
													direction: FlexDirection.Column,
													items: [
														new Label({
															text: oResourceBundle.getText("IMGEDITOR_HEIGHT"),
															labelFor: this.getId() + "-transformHeight"
														}),
														new Input({
															id: this.getId() + "-transformHeight",
															type: InputType.Number,
															textAlign: TextAlign.Right,
															change: this._onNumberInputChange.bind(this, mNumberInputHandlers.HEIGHT),
															value: {
																path: "/transform/height",
																type: "sap.ui.model.type.Integer",
																mode: "OneWay"
															},
															valueState: "{/transform/heightValueState}",
															valueStateText: "{/transform/heightValueStateText}",
															width: "5.9375rem",
															fieldWidth: "4.375rem",
															description: oResourceBundle.getText("IMGEDITOR_PX")
														})
													]
												})
											]
										}),
										new Button({
											width: "50%",
											text: oResourceBundle.getText("IMGEDITOR_APPLY"),
											type: ButtonType.Emphasized,
											press: this._applyPreview.bind(this)
										})
									]
								}).addStyleClass("sapSuiteUiCommonsImageEditorContainerPanelArea")
							]
						}),
						new IconTabFilter({
							key: "Rotate",
							text: oResourceBundle.getText("IMGEDITOR_ROTATE"),
							content: [
								this._getRotateGridList(),
								new FlexBox({
									renderType: FlexRendertype.Bare,
									direction: FlexDirection.Column,
									items: [
										new Label({
											id: this.getId() + "-transformAngle",
											text: oResourceBundle.getText("IMGEDITOR_TRANSFORM_ANGLE")
										}),
										new Slider({
											min: ImageEditor.LIMITS.ROTATION_MIN,
											max: ImageEditor.LIMITS.ROTATION_MAX,
											value: {path: "/transform/rotate", mode: "OneWay"},
											liveChange: this._onNumberInputChange.bind(this, mNumberInputHandlers.ROTATION),
											progress: true,
											ariaLabelledBy: [this.getId() + "-transformAngle"]
										}),
										new Input({
											type: InputType.Number,
											textAlign: TextAlign.Right,
											width: "50%",
											fieldWidth: "50%",
											description: oResourceBundle.getText("IMGEDITOR_TRANSFORM_DEG"),
											change: this._onNumberInputChange.bind(this, mNumberInputHandlers.ROTATION),
											value: {
												path: "/transform/rotate",
												type: "sap.ui.model.type.Integer",
												mode: "OneWay"
											},
											valueState: "{/transform/rotateValueState}",
											valueStateText: "{/transform/rotateValueStateText}",
											ariaLabelledBy: [this.getId() + "-transformAngle"]
										}),
										new Button({
											width: "50%",
											text: oResourceBundle.getText("IMGEDITOR_APPLY"),
											type: ButtonType.Emphasized,
											press: this._applyPreview.bind(this)
										})
									]
								}).addStyleClass("sapSuiteUiCommonsImageEditorContainerPanelArea")
							]
						}),
						new IconTabFilter({
							key: "Flip",
							text: oResourceBundle.getText("IMGEDITOR_FLIP"),
							content: [
								this._getFlipGridList(),
								new FlexBox({
									renderType: FlexRendertype.Bare,
									direction: FlexDirection.Column,
									items: [
										new Button({
											width: "50%",
											text: oResourceBundle.getText("IMGEDITOR_APPLY"),
											type: ButtonType.Emphasized,
											press: this._applyPreview.bind(this)
										})
									]
								}).addStyleClass("sapSuiteUiCommonsImageEditorContainerPanelArea")
							]
						})
					]
				}).addStyleClass("sapSuiteUiCommonsImageEditorContainerTabBar")
			];

			this._oTransformToolbarContent.forEach(function(oControl) {
				this.addDependent(oControl);
			}, this);
		}

		return this._oTransformToolbarContent;
	};

	ImageEditorContainer.prototype._onCropSizeInputChange = function(sMeasure, oEvent) {
		var iCurrentWidth = this._oModel.getProperty("/crop/width"),
			iCurrentHeight = this._oModel.getProperty("/crop/height"),
			bKeepAspectRatio = this._getKeepCropAspectRatio(),
			iWidth, iHeight, iCurrentValue, iMinMeasure, iMaxMeasure,
			iValue = parseInt(oEvent.getParameter("value"), 10);

		iValue = isNaN(iValue) ? 0 : iValue;

		if (sMeasure === "width") {
			iCurrentValue = iCurrentWidth;
			iWidth = iValue;
			iHeight = bKeepAspectRatio ? iWidth * iCurrentHeight / iCurrentWidth : iCurrentHeight;
			iMaxMeasure = this.getImageEditor()._getMaxCropAreaWidth(true);
			iMinMeasure = this.getImageEditor()._getMinCropAreaWidth(true);
		} else {
			iCurrentValue = iCurrentHeight;
			iHeight = iValue;
			iWidth = bKeepAspectRatio ? iHeight * iCurrentWidth / iCurrentHeight : iCurrentWidth;
			iMaxMeasure = this.getImageEditor()._getMaxCropAreaHeight(true);
			iMinMeasure = this.getImageEditor()._getMinCropAreaHeight(true);
		}

		this._resetValueStates();

		if (iValue > iMaxMeasure || iValue < iMinMeasure) {
			oEvent.getSource().setValue(iCurrentValue); // force back last correct value
			this._oModel.setProperty("/crop/" + sMeasure + "ValueState", ValueState.Warning);
			this._oModel.setProperty("/crop/" + sMeasure + "ValueStateText",
				oResourceBundle.getText("IMGEDITOR_BAD_NUMBER", [iMinMeasure, iMaxMeasure]));
		} else {
			this._setCropAreaBySize(iWidth, iHeight);
		}
	};

	ImageEditorContainer.prototype._getCropPanelContent = function() {
		var that = this;

		if (!this._oCropToolbarContent) {
			this._oCropToolbarContent = [
				new IconTabBar({
					tabDensityMode: IconTabDensityMode.Compact,
					backgroundDesign: BackgroundDesign.Transparent,
					headerBackgroundDesign: BackgroundDesign.Transparent,
					expandable: false,
					select: function(oEvent) {
						var sKey = oEvent.getParameter("key");
						that._setCropTypeByKey(sKey);
					},
					selectedKey: "{/crop/selectedTypeKey}",
					items: [
						new IconTabFilter({
							tooltip: oResourceBundle.getText("IMGEDITOR_CROP_RECTANGLE"),
							key: "Rectangle",
							text: "\ue17b",
							content: [
								this._getRectangleCropGridList()
							]
						}),
						new IconTabFilter({
							tooltip: oResourceBundle.getText("IMGEDITOR_CROP_ELLIPSE"),
							key: "Ellipse",
							text: "\ue255",
							content: [
								this._getEllipseCropGridList()
							]
						}),
						new IconTabFilter({
							tooltip: oResourceBundle.getText("IMGEDITOR_CROP_CUSTOM"),
							key: "CustomShape",
							text: "\ue057",
							content: [
								this._getCustomShapeCropGridList(),
								this._getCustomShapeCropContent()
							]
						})
					]
				}).addStyleClass("sapSuiteUiCommonsImageEditorContainerTabBar").addStyleClass("sapSuiteUiCommonsImageEditorContainerFilterIcons"),
				new FlexBox({
					renderType: FlexRendertype.Bare,
					direction: FlexDirection.Column,
					items: [
						new FlexBox({
							renderType: FlexRendertype.Bare,
							justifyContent: FlexJustifyContent.SpaceBetween,
							items: [
								new FlexBox({
									renderType: FlexRendertype.Bare,
									direction: FlexDirection.Column,
									items: [
										new Label({
											text: oResourceBundle.getText("IMGEDITOR_WIDTH"),
											labelFor: this.getId() + "-cropWidth"
										}),
										new Input({
											id: this.getId() + "-cropWidth",
											type: InputType.Number,
											textAlign: TextAlign.Right,
											value: {
												path: "/crop/width",
												mode: "OneWay",
												type: "sap.ui.model.type.Integer"
											},
											valueState: "{/crop/widthValueState}",
											valueStateText: "{/crop/widthValueStateText}",
											width: "5.9375rem",
											fieldWidth: "4.375rem",
											description: oResourceBundle.getText("IMGEDITOR_PX"),
											change: this._onCropSizeInputChange.bind(this, "width"),
											enabled: {
												parts: ["/crop/selectedTypeKey", "/crop/customShapeLoaded", "/crop/enabled"],
												formatter: function(sSelectedKey, bCustomShapeLoaded, bCropEnabled) {
													return !(sSelectedKey === "CustomShape" && !bCustomShapeLoaded) && bCropEnabled;
												}
											}
										})
									]
								}),
								new FlexBox({
									renderType: FlexRendertype.Bare,
									direction: FlexDirection.Column,
									justifyContent: FlexJustifyContent.End,
									items: [
										new ToggleButton({
											tooltip: oResourceBundle.getText("IMGEDITOR_LOCK_RATIO"),
											icon: mIcons.LOCK,
											type: ButtonType.Transparent,
											pressed: {path: "/crop/keepAspectRatio"},
											press: function(oEvent) {
												var sCurrentMode = that.getImageEditor().getMode(),
													sMode, fnSelectItem;

												that._resetValueStates();
												if (that._oModel.getProperty("/crop/selectedTypeKey") === "Rectangle") {
													sMode = ImageEditorMode.CropRectangle;
													fnSelectItem = that._selectRectangleCropCustomSizeItem.bind(that);
												} else if (that._oModel.getProperty("/crop/selectedTypeKey") === "Ellipse"){
													sMode = ImageEditorMode.CropEllipse;
													fnSelectItem = that._selectEllipseCropCustomSizeItem.bind(that);
												} else {
													sMode = ImageEditorMode.CropCustomShape;
													fnSelectItem = that._selectCustomShapeCropCustomSizeItem.bind(that);

												}

												if (sCurrentMode !== sMode) {
													that.getImageEditor().setMode(sMode);
												}

												if (fnSelectItem) {
													fnSelectItem(oEvent.getParameter("pressed"));
												}
											}
										})
									]
								}),
								new FlexBox({
									renderType: FlexRendertype.Bare,
									direction: FlexDirection.Column,
									items: [
										new Label({
											text: oResourceBundle.getText("IMGEDITOR_HEIGHT"),
											labelFor: this.getId() + "-cropHeight"
										}),
										new Input({
											id: this.getId() + "-cropHeight",
											type: InputType.Number,
											textAlign: TextAlign.Right,
											value: {
												path: "/crop/height",
												mode: "OneWay",
												type: "sap.ui.model.type.Integer"
											},
											valueState: "{/crop/heightValueState}",
											valueStateText: "{/crop/heightValueStateText}",
											width: "5.9375rem",
											fieldWidth: "4.375rem",
											description: oResourceBundle.getText("IMGEDITOR_PX"),
											change: this._onCropSizeInputChange.bind(this, "height"),
											enabled: {
												parts: ["/crop/selectedTypeKey", "/crop/customShapeLoaded", "/crop/enabled"],
												formatter: function(sSelectedKey, bCustomShapeLoaded, bCropEnabled) {
													return !(sSelectedKey === "CustomShape" && !bCustomShapeLoaded) && bCropEnabled;
												}
											}
										})
									]
								})
							]
						}),
						new FlexBox({
							renderType: FlexRendertype.Bare,
							alignItems: FlexAlignItems.Center,
							items: [
								this._getScaleSwitch(),
								this._getScaleLabel()
							]
						}).addStyleClass("sapUiSmallMarginTopBottom"),
						new Button({
							width: "50%",
							text: oResourceBundle.getText("IMGEDITOR_APPLY"),
							type: ButtonType.Emphasized,
							press: this._applyPreview.bind(this),
							enabled: {
								parts: ["/crop/selectedTypeKey", "/crop/customShapeLoaded", "/crop/enabled"],
								formatter: function(sSelectedKey, bCustomShapeLoaded, bCropEnabled) {
									return !(sSelectedKey === "CustomShape" && !bCustomShapeLoaded) && bCropEnabled;
								}
							}
						})
					]
				}).addStyleClass("sapSuiteUiCommonsImageEditorContainerPanelArea")
			];

			this._oCropToolbarContent.forEach(function(oControl) {
				this.addDependent(oControl);
			}, this);
		}

		return this._oCropToolbarContent;
	};

	ImageEditorContainer.prototype._getCustomShapeCropContent = function() {
		var that = this;

		if (!this.oCustomShapeContent) {
			this.oCustomShapeContent = new FlexBox({
				renderType: FlexRendertype.Bare,
				direction: FlexDirection.Column,
				items: [
					new Label({
						text: oResourceBundle.getText("IMGEDITOR_CROP_CUSTOM_FILE"),
						labelFor: this.getId() + "-customFile"
					}),
					new FileUploader({
						id: this.getId() + "-customFile",
						mimeType: "image/*",
						change: function(oEvent) {
							var oFile = oEvent.getParameter("files")[0];

							if (!oFile) {
								return;
							}

							that._resetValueStates();
							that._enableCrop();
							that.getImageEditor().setMode(ImageEditorMode.CropCustomShape);
							that.getImageEditor().setCustomShapeSrc(oFile);
						}
					})
				]
			}).addStyleClass("sapSuiteUiCommonsImageEditorContainerPanelArea").addStyleClass("sapSuiteUiCommonsImageEditorContainerPanelAreaMobile");
			this.addDependent(this.oCustomShapeContent);
		}

		return this.oCustomShapeContent;
	};

	ImageEditorContainer.prototype._getFilterPanelContent = function() {
		var that = this;

		if (!this._oFilterToolbarContent) {
			this._oFilterToolbarContent = [
				new Slider({
					min: "{/filter/selectedFilter/min}",
					max: "{/filter/selectedFilter/max}",
					showAdvancedTooltip: true,
					value: {path: "/filter/selectedFilter/value", mode: "OneWay"},
					liveChange: this._onNumberInputChange.bind(this, mNumberInputHandlers.FILTER),
					progress: true,
					ariaLabelledBy: [this.getId() + "-filterValue"]
				}).addStyleClass("sapSuiteUiCommonsImageEditorContainerMobileSlider"),
				this._getFilterGridList(),
				new FlexBox({
					renderType: FlexRendertype.Bare,
					direction: FlexDirection.Column,
					items: [
						new Slider({
							min: "{/filter/selectedFilter/min}",
							max: "{/filter/selectedFilter/max}",
							value: {path: "/filter/selectedFilter/value", mode: "OneWay"},
							liveChange: this._onNumberInputChange.bind(this, mNumberInputHandlers.FILTER),
							progress: true,
							ariaLabelledBy: [this.getId() + "-filterValue"]
						}),
						new Label({
							id: this.getId() + "-filterValue",
							text: oResourceBundle.getText("IMGEDITOR_FILTER_VALUE")
						}),
						new Input({
							type: InputType.Number,
							textAlign: TextAlign.Right,
							width: "5.9375rem",
							fieldWidth: "4.375rem",
							description: "{/filter/selectedFilter/unit}",
							change: function(oEvent) {
								that._onNumberInputChange(jQuery.extend(mNumberInputHandlers.FILTER, that._oModel.getProperty("/filter/selectedFilter")), oEvent);
							},
							value: {
								path: "/filter/selectedFilter/value", type: "sap.ui.model.type.Integer", mode: "OneWay"
							},
							valueState: "{/filter/filterValueState}",
							valueStateText: "{/filter/filterValueStateText}",
							ariaLabelledBy: [this.getId() + "-filterValue"]
						}),
						new Button({
							width: "50%",
							text: oResourceBundle.getText("IMGEDITOR_APPLY"),
							type: ButtonType.Emphasized,
							press: this._applyPreview.bind(this)
						})
					]
				}).addStyleClass("sapSuiteUiCommonsImageEditorContainerPanelArea")
			];

			this._oFilterToolbarContent.forEach(function(oControl) {
				this.addDependent(oControl);
			}, this);
		}

		return this._oFilterToolbarContent;
	};


	ImageEditorContainer.prototype._getOptionsPanel = function() {
		if (!this._oOptionsPanel) {
			this._oOptionsPanel = new FlexBox({
				renderType: FlexRendertype.Bare,
				direction: FlexDirection.Column
			});
			this._oOptionsPanel.addStyleClass("sapSuiteUiCommonsImageEditorContainerPanel");
			this._oOptionsPanel.setModel(this._oModel);
			this.addDependent(this._oOptionsPanel);
		}

		return this._oOptionsPanel;
	};

	// keyboard hotkeys
	// certain key combinations on chrome are blocked and cannot be handled by javascript (ctrl + t/w/n)
	// https://stackoverflow.com/questions/7295508/javascript-capture-browser-shortcuts-ctrlt-n-w/7296303#7296303
	ImageEditorContainer.prototype.onkeydown = function(oEvent) {
		var that = this;

		function canUndo() {
			return that._oModel.getProperty("/historyIndex") < that._oModel.getProperty("/history").length - 1;
		}

		if (oEvent.ctrlKey && oEvent.key !== "Control" && oEvent.shiftKey && oEvent.key !== "Shift") {
			switch (oEvent.key) {
				case "z":
				case "Z":
					if (canUndo()) {
						this.getImageEditor().undo();
						if (canUndo()) {
							this._getUndoButton().focus();
						} else {
							this._getHistoryArrowButton().focus();
						}
					}
					oEvent.preventDefault();
					break;
				case "y":
				case "Y":
					if (this._oModel.getProperty("/historyIndex") > 0) {
						this.getImageEditor().redo();
						this._getUndoButton().focus();
					}
					oEvent.preventDefault();
					break;
				case "h":
				case "H":
					if (this._oModel.getProperty("/history").length > 1) {
						this._getHistoryArrowButton().focus();
						this._getHistoryPopover().openBy(this._oHistoryArrowButton);
					}
					oEvent.preventDefault();
					break;
				default:
					break;
			}
		} else if (oEvent.ctrlKey && oEvent.key !== "Control" && !oEvent.shiftKey) {
			switch (oEvent.key) {
				case "u":
				case "U":
					this._focusOnToolbar();
					oEvent.preventDefault();
					break;
				case "g":
				case "G":
					this._focusOnPanel();
					oEvent.preventDefault();
					break;
				case "i":
				case "I":
					this._focusOnImageEditor();
					oEvent.preventDefault();
					break;
				case "e":
				case "E":
					this._setModeTransform("Resize");
					this._focusOnItem(this._getResizeGridList().getItems()[0]);
					oEvent.preventDefault();
					break;
				case "r":
				case "R":
					this._setModeTransform("Rotate");
					this._focusOnItem(this._getRotateGridList().getItems()[0]);
					oEvent.preventDefault();
					break;
				case "f":
				case "F":
					this._setModeTransform("Flip");
					this._focusOnItem(this._getFlipGridList().getItems()[0]);
					oEvent.preventDefault();
					break;
				case "j":
				case "J":
					this._setModeCrop("Rectangle");
					this._focusOnItem(this._getRectangleCropGridList().getItems()[0]);
					oEvent.preventDefault();
					break;
				case "s":
				case "S":
					this._setModeFilter();
					this._focusOnItem(this._getFilterGridList().getItems()[0]);
					oEvent.preventDefault();
					break;
				case "Enter":
					this._applyPreview();
					break;
				default:
					break;
			}
		} else if (oEvent.altKey && oEvent.key !== "Alt") {
			switch (oEvent.key) {
				case "Enter":
					this._switchFocusPanelImage();
					oEvent.preventDefault();
					break;
				default:
					break;
			}
		}
	};

	ImageEditorContainer.prototype._focusFirstTabbable = function($elem) {
		var oFirstTabbable = $elem.find(":tabbable").get(0);

		if (oFirstTabbable) {
			oFirstTabbable.focus();
		}
	};

	ImageEditorContainer.prototype._focusOnToolbar = function() {
		this._focusFirstTabbable(this._getHeaderToolbar().$());
	};

	ImageEditorContainer.prototype._focusOnPanel = function() {
		this._focusFirstTabbable(this._getOptionsPanel().$());
	};

	ImageEditorContainer.prototype._focusOnImageEditor = function() {
		this._focusFirstTabbable(this.getImageEditor().$());
	};

	ImageEditorContainer.prototype._focusOnItem = function(oItem) {
		// we want to put focus on some items (e.g. on first item in resize panel after clicking on transform button)
		// but sometimes the item is not rendered just yet, so we will put the focus on them onAfterRendering in that case
		if (oItem.getDomRef()) {
			if (!this._getHistoryPopover().isOpen()) {
				oItem.focus();
			}
		} else {
			var oDelegate = {
				onAfterRendering: function() {
					oItem.removeEventDelegate(oDelegate);
					oItem.focus();

					if (oItem.getParent() && oItem.getParent().isA("sap.m.List")) {
						// force item navigation to start, otherwise arrow keys won't work until focusIn event is somehow retriggered (e.g. user goes out of browser and then back in)
						oItem.getParent()._startItemNavigation();
					}
				}
			};

			oItem.addEventDelegate(oDelegate);
		}
	};

	/**
	 * Toggle focus between options panel and image editor
	 * If none of them is focused, focus on the panel
	 * @private
	 */
	ImageEditorContainer.prototype._switchFocusPanelImage = function() {
		var oActiveElement = document.activeElement;

		if (this._getOptionsPanel().getDomRef().contains(oActiveElement)) {
			this._focusOnImageEditor();
		} else {
			this._focusOnPanel();
		}
	};

	return ImageEditorContainer;

});
