/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides control sap.ui.richtexteditor.RichTextEditor.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/Control',
	'sap/ui/core/library',
	'sap/ui/core/Locale',
	'sap/ui/core/ResizeHandler',
	'./library',
	'./ToolbarWrapper',
	"sap/ui/dom/includeScript",
	"sap/base/Log",
	"sap/base/security/sanitizeHTML",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	// Control renderer
	"./RichTextEditorRenderer"
],
	function(
		jQuery,
		Control,
		coreLibrary,
		Locale,
		ResizeHandler,
		library,
		ToolbarWrapper,
		includeScript,
		Log,
		sanitizeHTML,
		KeyCodes,
		Core
	) {
	"use strict";

	var TextDirection = coreLibrary.TextDirection;

	/**
	 * Describes the internal status of the editor component used inside the RichTextEditor control.
	 *
	 * @enum {string}
	 * @private
	 */
	var EditorStatus = {
		/**
		 * Uses TinyMCE as editor
		 * @private
		 */
		Initial: "Initial",
		Loading: "Loading",
		Initializing: "Initializing",
		Loaded: "Loaded",
		Ready: "Ready",
		Destroyed: "Destroyed"
	};

	/**
	 * Constructor for a new RichTextEditor.
	 *
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * The RichTextEditor-Control is used to enter formatted text. It uses the third-party component called TinyMCE.
	 * In addition to the native toolbar, you can also use a toolbar built with SAPUI5 controls.
	 * <h3>Overview</h3>
	 *
	 * With version 1.48 onward, aside from the native toolbar of the TinyMCE, the <code>RichTextEditor</code> can also use a
	 * toolbar built with SAPUI5 controls. Which toolbar is used is taken into consideration only while the
	 * control is being initialized and it will not be possible to change it during runtime, because of
	 * lifecycle incompatibilities between the SAPUI5 and the third-party library.
	 * The custom toolbar acts like a wrapper to the native toolbar and takes care of
	 * synchronizing the state of its internal controls with the current state of the selection in the editor
	 * (bold, italics, font styles etc.).
	 *
	 * <h4>Restrictions</h4>
	 *
	 * <b>Note: The <code>RichTextEditor</code> uses a third-party component and therefore
	 * some additional restrictions apply for its proper usage and support.
	 * For more information see the Preamble section in {@link topic:d4f3f1598373452bb73f2120930c133c sap.ui.richtexteditor}.
	 * </b>
	 *
	 * <h3>Guidelines</h3>
	 * <ul>
	 * <li> The <code>RichTextEditor</code> should be used for desktop apps only. However, if it is essential for your use case, you can enable the mobile version of TinyMCE, whilst having in mind the restrictions. For more information see the {@link topic:d4f3f1598373452bb73f2120930c133c sap.ui.richtexteditor documentation}.</li>
	 * <li> In order to be usable, the control needs a minimum width 17.5 rem and height of 12.5 rem.</li>
	 * <li> Do not instantiate the <code>RichTextEditor</code> from a hidden container.</li>
	 * <li> Make sure you destroy the <code>RichTextEditor</code> instance instead of hiding it and create a new one when you show it again.</li>
	 * </ul>
	 *
	 * <h3>Usage</h3>
	 *
	 * <h4>When to use</h4>
	 * <ul>
	 * <li>You want to enable users to enter text and other elements (tables, images) with different styles and colors.</li>
	 * <li>You need to provide a tool for texts that require additional formatting.</li>
	 * </ul>
	 *
	 * <h4> When not to use</h4>
	 * <ul>
	 * <li>You want to let users add simple text that doesn’t require formatting. Use {@link sap.m.TextArea text area} instead.</li>
	 * <li>Use callbacks to the native third-party API with care, as there may be compatibility issues with later versions.</li>
	 * </ul>
	 *
	 * <h3>Custom toolbar - adding and removing buttons</h3>
	 * With version 1.102 it is possible to redefine the button groups configuration in order to show only particular set of buttons in the custom toolbar of the <code>RichTextEditor</code>.
	 * This is possible in few ways:
	 * <ul>
	 * <li>By providing the buttons group configurations as a whole by setting the <code>buttonGroups</code> property of the control.</li>
	 * <li>By providing individual button group configuration via <code>addButtonGroup</code> method.</li>
	 * </ul>
	 *
	 * Consider the following when choosing your approach:
	 * <ul>
	 * <li>Setting <code>buttonGroups</code> will override all current custom toolbar button group configurations. This method allows for total redefining of the custom toolbar groups.</li>
	 * <li>Using <code>addButtonGroups</code> will try to add non-existing group into the configuration array, however, if such group configuration exists already, a warning will be logged and the new configuration will not be added. In order to replace the existing configuration you will need to remove it first via <code>removeButtonGroup</code>.</li>
	 * </ul>
	 *
	 * Below is a list of supported groups and buttons, which can be specified in the configuration objects (format is <<group name>>: <<supported buttons>>):
	 *	<ul>
	 *		<li>font-style: bold, italic, underline, strikethrough</li>
	 *		<li>font: fontfamily (fontselect in TinyMCE5), fontsize (fontsizeselect in TinyMCE5), forecolor, backcolor</li>
	 *		<li>clipboard: cut, copy, paste</li>
	 *		<li>structure: bullist, numlist, outdent, indent</li>
	 *		<li>undo: undo, redo</li>
	 *		<li>insert: image, emoticons</li>
	 *		<li>link: link, unlink</li>
	 *		<li>text-align: alignleft, aligncenter, alignright, alignjustify</li>
	 *	</ul>
	 * Additional supported groups, which can be added only after the editor is loaded (they can not be specified in the above mentioned configuration):
	 *	<ul>
	 *		<li>table: table</li>
	 *		<li>styleselect: styleselect</li>
	 *	<ul>
	 * <b>Note!</b> Adding configuration for "text-align" group with any buttons will still render a menu button with all available options inside. Removing/hiding the group can be achieved by invoking <code>removeButtonGroup</code> or <code>setShowGroupTextAlign(false)</code> depending on the desired result.
	 *
	 * <b>Note!</b> There is no synchronization between the <code>setShowGroup*</code> properties and the configuration object that the application can specifying via <code>buttonGroups</code> in the constructor or on a later stage. This means that in case new configuration is provided and for particular group the passed object contains property <code>visible: true</code>, this group property will be respected no matter if the <code>RichTextEditor</code>'s property for this particular group is set to <code>false</code>.
	 * Example:
	 * Providing the following object as group configuration:
	 * {
	 * 	name: "font"
	 * 	visible: true
	 * }
	 * Will make the "font" group visible, no matter that calling <code>RichTextEditor.getShowGroupFont()</code> returns <code>false</code>.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @disclaimer Since version 1.6.0.
	 * The RichTextEditor of SAPUI5 contains a third party component TinyMCE provided by Moxiecode Systems AB. The SAP license agreement covers the development of applications with RichTextEditor of SAPUI5 (as of May 2014).
	 * @alias sap.ui.richtexteditor.RichTextEditor
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/rich-text-editor/ Rich Text Editor}
	 * @see {@link topic:d4f3f1598373452bb73f2120930c133c}
	 */
	var RichTextEditor = Control.extend("sap.ui.richtexteditor.RichTextEditor", /** @lends sap.ui.richtexteditor.RichTextEditor.prototype */ {
		metadata: {

			library: "sap.ui.richtexteditor",
			properties: {

				/**
				 * An HTML string representing the editor content. Because this is HTML, the value cannot be generically escaped to prevent cross-site scripting, so the application is responsible for doing so.
				 * Overwriting this property would also reset editor's Undo manager and buttons "Undo"/"Redo" would be set to their initial state.
				 */
				value: { type: "string", group: "Data", defaultValue: '' },

				/**
				 * The text direction
				 */
				textDirection: { type: "sap.ui.core.TextDirection", group: "Appearance", defaultValue: TextDirection.Inherit },

				/**
				 * Width of RichTextEditor control in CSS units.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null },

				/**
				 * Height of RichTextEditor control in CSS units.
				 * <b>Note:</b> If the height property results in a value smaller than 200px, the minimum height of 200px will be applied.
				 * <b>Note:</b> If the "autoresize" TinyMCE plugin is used, the height property is not taken into account.
				 */
				height: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null },

				/**
				 * The editor implementation to use.
				 *
				 * Valid values are the ones found under sap.ui.richtexteditor.EditorType and any
				 * other editor identifier that may be introduced by other groups (hence this is
				 * not an enumeration).
				 *
				 * <b>Notes:</b>
				 * <ul><li>TinyMCE version 3 and 4 are no longer supported and cannot be used. If you set the property to TinyMCE, it will load TinyMCE version 6.</li>
				 * <li>Any attempts to set this property after the first rendering will not
				 * have any effect.</li>
				 * <li>The default value of the property will always resolve to the recommended version by UI5. Due to the different support cycles, we will be constantly getting newer TinyMCE versions and update the default value accordingly.</li>
				 * <li>Usage of internal TinyMCE APIs is not recommended, since it might lead to issues upon TinyMCE version update.</li>
				 * <li>Have in mind when choosing a specific TinyMCE version that there might be differences in the support rules compared to UI5, therefore we might be forced to remove any TinyMCE version.</li>
				 * <li>TinyMCE 4 is out of support and by using it, application developers are accepting all the risks comming from that fact. In addition TinyMCE 4 will be removed in future releases.</li>
				 * <li>TinyMCE 5 will be removed in future releases.</li>
				 * </ul>
				 */
				editorType: { type: "string", group: "Misc", defaultValue: 'TinyMCE' },

				/**
				 * Relative or absolute URL where the editor is available. Must be on the same server.
				 * <b>Note:</b> Any attempts to set this property after the first rendering will not have any effect.
				 * @deprecated Since version 1.25.0.
				 * The editorLocation is set implicitly when choosing the editorType.
				 */
				editorLocation: { type: "string", group: "Misc", defaultValue: 'js/tiny_mce4/tinymce.js', deprecated: true },

				/**
				 * Determines whether the editor content can be modified by the user. When set to "false" there might not be any editor toolbar.
				 */
				editable: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * Determines whether the toolbar button group containing commands like Bold, Italic, Underline and Strikethrough is available. Changing this after the initial rendering will result in some visible redrawing.
				 * Note: This property will not be synchronized with group configuration provided via the buttonGroups property or when groups are added on a later stage.
				 */
				showGroupFontStyle: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * Determines whether the toolbar button group containing text alignment commands is available. Changing this after the initial rendering will result in some visible redrawing.
				 * Note: This property will not be synchronized with group configuration provided via the buttonGroups property or when groups are added on a later stage.
				 */
				showGroupTextAlign: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * Determines whether the toolbar button group containing commands like Bullets and Indentation is available. Changing this after the initial rendering will result in some visible redrawing.
				 * Note: This property will not be synchronized with group configuration provided via the buttonGroups property or when groups are added on a later stage.
				 */
				showGroupStructure: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * Determines whether the toolbar button group containing commands like Font, Font Size and Colors is available. Changing this after the initial rendering will result in some visible redrawing.
				 * Note: This property will not be synchronized with group configuration provided via the buttonGroups property or when groups are added on a later stage.
				 */
				showGroupFont: { type: "boolean", group: "Misc", defaultValue: false },

				/**
				 * Determines whether the toolbar button group containing commands like Cut, Copy and Paste is available. Changing this after the initial rendering will result in some visible redrawing.
				 * Note: This property will not be synchronized with group configuration provided via the buttonGroups property or when groups are added on a later stage.
				 */
				showGroupClipboard: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * Determines whether the toolbar button group containing commands like Insert Image and Insert Smiley is available. Changing this after the initial rendering will result in some visible redrawing.
				 * Note: This property will not be synchronized with group configuration provided via the buttonGroups property or when groups are added on a later stage.
				 */
				showGroupInsert: { type: "boolean", group: "Misc", defaultValue: false },

				/**
				 * Determines whether the toolbar button group containing commands like Create Link and Remove Link is available. Changing this after the initial rendering will result in some visible redrawing.
				 * Note: This property will not be synchronized with group configuration provided via the buttonGroups property or when groups are added on a later stage.
				 */
				showGroupLink: { type: "boolean", group: "Misc", defaultValue: false },

				/**
				 * Determines whether the toolbar button group containing commands like Undo and Redo is available. Changing this after the initial rendering will result in some visible redrawing.
				 * Note: This property will not be synchronized with group configuration provided via the buttonGroups property or when groups are added on a later stage.
				 */
				showGroupUndo: { type: "boolean", group: "Misc", defaultValue: false },

				/**
				 * Determines whether the text in the editor is wrapped. This does not affect the editor's value, only the representation in the control.
				 */
				wrapping: { type: "boolean", group: "Appearance", defaultValue: true },

				/**
				 * Determines whether a value is required.
				 */
				required: { type: "boolean", group: "Misc", defaultValue: false },

				/**
				 * Determines whether to run the HTML sanitizer once the value (HTML markup) is applied or not. To configure allowed URLs please use the validator API via {@link module:sap/base/security/URLListValidator#add URLListValidator API}.
				 */
				sanitizeValue: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * An array of plugin configuration objects with the obligatory property "name".
				 * Each object has to contain a property "name" which then contains the plugin name/ID.
				 */
				plugins: { type: "object[]", group: "Behavior", defaultValue: [] },

				/**
				 * Determines whether or not to use the legacy theme for the toolbar buttons. If this is set to false, the default theme for the editor will be used (which might change slightly with every update). The legacy theme has the disadvantage that not all functionality has its own icon, so using non default buttons might lead to invisible buttons with the legacy theme - use the default editor theme in this case.
				 * @deprecated Since version 1.97.0
				 * This property became obsolete after the deprecation of TinyMCE v3.
				 */
				useLegacyTheme: { type: "boolean", group: "Appearance", defaultValue: true, deprecated: true },

				/**
				 * An array of button configurations. These configurations contain the names of buttons as array in the property "buttons" and the name of the group in "name", they can also contain the "row" where the buttons should be placed, a "priority" and whether the buttons are "visible". See method addButtonGroup() for more details on the structure of the objects in this array.
				 * <b>Note:</b> <code>buttonGroups</code> is a feature from the native editor. Its supported scope with <code>customToolbar</code> is limited up to the grouping- the user could turn on/off a whole group, but modifying buttons within a group is not possible. In order to achieve that functionality with <code>customToolbar</code>, the developer needs to turn the group off and instantiate their own <code>sap.m.Button</code>(s) with the desired functionality.
				 */
				buttonGroups: {type: "object[]", group: "Behavior", defaultValue: [] },

				/**
				 * Determines whether a Fiori Toolbar is used instead of the TinyMCE default toolbar one. It is applied only when the EditorType is TinyMCE5 or TinyMCE6 and sap.m library is loaded.
				 * <b>Note:</b> The <code>customToolbar</code> property will have effect only on initial loading. Changing it during runtime will not affect the initially loaded toolbar.
				 *
				 * @since 1.48
				 */
				customToolbar: { type: "boolean", group: "Misc", defaultValue: false }
			},
			events: {

				/**
				 * Event is fired when the text in the field has changed AND the focus leaves the editor or when the Enter key is pressed.
				 */
				change: {
					parameters: {

						/**
						 * The new control value.
						 */
						newValue: { type: "string" }
					}
				},

				/**
				 * Fired when the used editor is loaded and ready (its HTML is also created).
				 */
				ready: {},

				/**
				 * Analogous to the ready event, the event is fired when the used editor is loaded and ready. But the event is fired after every time the control is ready to use and not only once like the ready event.
				 */

				readyRecurring: {},

				/**
				 * This event is fired right before the TinyMCE instance is created and can be used to change the settings object that will be given to TinyMCE. The parameter "configuration" is the javascript object that will be given to TinyMCE upon first instantiation. The configuration parameter contains a map that can be changed in the case of TinyMCE.
				 * <b>Note:</b> In order to add plugins to the <code>RichTextEditor</code> control, you have to use the <code>addPlugin</code> method. Adding plugins through the settings object may lead to synchronizing issues between TinyMCE and <code>RichTextEditor</code> control.
				 */
				beforeEditorInit: {}
			},
			aggregations: {
				/**
				 * Custom toolbar wrapper.
				 * The wrapper gets instantiated when customToolbar property is set to true.
				 *
				 * @since 1.48
				 */
				_toolbarWrapper: {type: "sap.ui.richtexteditor.IToolbar", multiple: false, visibility : "hidden", defaultValue: null},
				/**
				 * Custom buttons are meant to extend the <code>RichTextEditor</code>'s custom toolbar.
				 * Though type is set to sap.ui.Control, only sap.m.Button is allowed.
				 * <b>Note:</b> customButtons are available only when the customToolbar is enabled and all the requirements are fulfilled.
				 *
				 * @since 1.48
				 */
				customButtons: {type: "sap.ui.core.Control", multiple: true, singularName: "customButton", defaultValue: null}
			},
			associations: {
				/**
				 * Association to controls / IDs which label this control (see WAI-ARIA attribute <code>aria-labelledby</code>).
				 * @since 1.76.0
				 */
				ariaLabelledBy: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "ariaLabelledBy"
				}
			}
		}
	});



	// global tinymce
	// Tells JSLint/SAPUI5 validation we need access to this global variable

	/*
	 * The following code is editor-independent
	 */
	// Counter for creating internal ids
	RichTextEditor._lastId = 0;

	RichTextEditor._iCountInstances = 0;

	RichTextEditor.BUTTON_GROUPS = library.ButtonGroups;

	// Editor type entries for backwards compatibility
	RichTextEditor.EDITORTYPE_TINYMCE4 = library.EditorType.TinyMCE4;
	RichTextEditor.EDITORTYPE_TINYMCE5 = library.EditorType.TinyMCE5;
	RichTextEditor.EDITORTYPE_TINYMCE6 = library.EditorType.TinyMCE6;

	// default
	RichTextEditor.EDITORTYPE_TINYMCE = library.EditorType.TinyMCE;

	var EDITOR_LOCATION_MAPPING = {};

	// default
	EDITOR_LOCATION_MAPPING[RichTextEditor.EDITORTYPE_TINYMCE] = "js/tiny_mce6/tinymce.min.js";

	EDITOR_LOCATION_MAPPING[RichTextEditor.EDITORTYPE_TINYMCE4] = "js/tiny_mce4/tinymce.min.js";
	EDITOR_LOCATION_MAPPING[RichTextEditor.EDITORTYPE_TINYMCE5] = "js/tiny_mce5/tinymce.min.js";
	EDITOR_LOCATION_MAPPING[RichTextEditor.EDITORTYPE_TINYMCE6] = "js/tiny_mce6/tinymce.min.js";

	RichTextEditor.DEFAULT_PLUGINS_TINYMCE5 = [
		"emoticons",
		"directionality",
		"tabfocus",
		"table",
		"image",
		"link",
		"textcolor",
		"colorpicker",
		"textpattern",
		"powerpaste"
	];
	RichTextEditor.DEFAULT_PLUGINS_TINYMCE6 = [
		"emoticons",
		"directionality",
		"image",
		"table",
		"link",
		"powerpaste"
	];

	// TinyMCE does not provide some of the regions/languages that our messagebundle has, therefore with this mapping, we are falling back to the ones provided
	RichTextEditor.MAPPED_LANGUAGES_TINYMCE = {
		"bg": "bg_BG",
		"en_US": "en_GB",
		"fr": "fr_FR",
		"fr_CA": "fr_FR",
		"hu": "hu_HU",
		"in": "id",
		"iw": "he",
		"ji": "yi",
		"ko": "ko_KR",
		"no": "nb",
		"pt": "pt_PT",
		"sh": "sr",
		"sl": "sl_SI",
		"sv": "sv_SE",
		"th": "th_TH"

	};

	RichTextEditor.SUPPORTED_LANGUAGES_TINYMCE = {
		"en": true, // Default
		"af_ZA": true,
		"ar_SA": true,
		"ar": true,
		"az": true,
		"be": true,
		"bg_BG": true,
		"bn_BD": true,
		"bs": true,
		"ca": true,
		"cs_CZ": true,
		"cs": true,
		"cy": true,
		"da": true,
		"de_AT": true,
		"de": true,
		"dv": true,
		"el": true,
		"en_CA": true,
		"en_GB": true,
		"es_MX": true,
		"es": true,
		"et": true,
		"eu": true,
		"fa_IR": true,
		"fa": true,
		"fi": true,
		"fo": true,
		"fr_FR": true,
		"ga": true,
		"gd": true,
		"gl": true,
		"he_IL": true,
		"hi": true,
		"hi_IN": true,
		"hr": true,
		"hu_HU": true,
		"hy": true,
		"id": true,
		"is_IS": true,
		"it": true,
		"ja": true,
		"ka_GE": true,
		"kab": true,
		"kk": true,
		"km_KH": true,
		"ko_KR": true,
		"ku_IQ": true,
		"ku": true,
		"lb": true,
		"lt": true,
		"lv": true,
		"ml_IN": true,
		"ml": true,
		"mn_MN": true,
		"nb_NO": true,
		"nl": true,
		"pl": true,
		"pt_BR": true,
		"pt_PT": true,
		"ro": true,
		"ru": true,
		"si_LK": true,
		"sk": true,
		"sl_SI": true,
		"sl": true,
		"sr": true,
		"sv_SE": true,
		"ta_IN": true,
		"ta": true,
		"tg": true,
		"th_TH": true,
		"tr_TR": true,
		"tr": true,
		"tt": true,
		"ug": true,
		"uk_UA": true,
		"uk": true,
		"uz": true,
		"vi_VN": true,
		"vi": true,
		"zh_CN": true,
		"zh_TW": true
	};

	RichTextEditor.SUPPORTED_LANGUAGES_TINYMCE5 = {
		"eo": true,
		"es_ES": true,
		"it_IT": true,
		"ro_RO": true
	};

	RichTextEditor.SUPPORTED_LANGUAGES_TINYMCE6 = RichTextEditor.SUPPORTED_LANGUAGES_TINYMCE5;

	RichTextEditor.SUPPORTED_LANGUAGES_DEFAULT_REGIONS = {
		"zh": "CN",
		"fr": "FR",
		"bn": "BD",
		"bg": "BG",
		"ka": "GE",
		"he": "IL",
		"hi": "IN",
		"hu": "HU",
		"is": "IS",
		"km": "KH",
		"ko": "KR",
		"ku": "IQ",
		"ml": "IN",
		"mn": "MN",
		"nb": "NO",
		"pt": "PT",
		"si": "SI",
		"sl": "SI",
		"sv": "SE",
		"th": "TH",
		"tr": "TR",
		"vi": "VN"
	};

	RichTextEditor.SUPPORTED_LANGUAGES_DEFAULT_REGIONS_TINYMCE6 = {
		"zh": "CN",
		"fr": "FR",
		"bn": "BD",
		"bg": "BG",
		"ka": "GE",
		"he": "IL",
		"hu": "HU",
		"is": "IS",
		"km": "KH",
		"ko": "KR",
		"ku": "IQ",
		"ml": "IN",
		"mn": "MN",
		"nb": "NO",
		"pt": "PT",
		"si": "SI",
		"sl": "SI",
		"sv": "SE",
		"th": "TH"
	};

	RichTextEditor.pLoadTinyMCE = null;
	var oEditorMapping = {};

	// default
	oEditorMapping[RichTextEditor.EDITORTYPE_TINYMCE] = RichTextEditor.EDITORTYPE_TINYMCE6;

	// other versions
	oEditorMapping[RichTextEditor.EDITORTYPE_TINYMCE4] = RichTextEditor.EDITORTYPE_TINYMCE4;
	oEditorMapping[RichTextEditor.EDITORTYPE_TINYMCE5] = RichTextEditor.EDITORTYPE_TINYMCE5;
	oEditorMapping[RichTextEditor.EDITORTYPE_TINYMCE6] = RichTextEditor.EDITORTYPE_TINYMCE6;

	/**
	 * Creates and returns a promise to load the given location as script url. Only the first invocation needs the
	 * sLocation argument as all subsequent calls return the initially created promise. This corresponds to the
	 * fact that only one TinyMCE version can be loaded on the page. The promise can still be used to determine
	 * when the TinyMCE API will be available.
	 *
	 * @param {string} sLocation - The URL of the TinyMCE script
	 * @returns {Promise} - The promise to load the URL given on first invocation
	 * @private
	 */
	RichTextEditor.loadTinyMCE = function(sLocation) {
		if (sLocation) {
			var sRealLocation = sap.ui.require.toUrl('sap/ui/richtexteditor/' + sLocation),
				oScriptElement = document.querySelector("#sapui5-tinyMCE"),
				sLoadedLocation = oScriptElement ? oScriptElement.getAttribute("src") : "";


			if (sRealLocation !== sLoadedLocation && RichTextEditor._iCountInstances === 1) {
				delete window.tinymce;
				delete window.TinyMCE;
				RichTextEditor.pLoadTinyMCE = null;
			}

			if (!RichTextEditor.pLoadTinyMCE) {
				RichTextEditor.pLoadTinyMCE = includeScript({
					id: "sapui5-tinyMCE",
					url: sRealLocation
				});
			}
		}
		return RichTextEditor.pLoadTinyMCE;
	};

	/**
	 * Initialization
	 * @private
	 */
	RichTextEditor.prototype.init = function() {
		var sEditorType = oEditorMapping[this.getEditorType()] || RichTextEditor.EDITORTYPE_TINYMCE;

		this._bEditorCreated = false;
		this._sTimerId = null;
		RichTextEditor._iCountInstances++;

		this._textAreaId = this.getId() + "-textarea";
		this._iframeId = this._textAreaId + "_ifr";

		this._textAreaDom = document.createElement("textarea");
		this._textAreaDom.id = this._textAreaId;
		this._textAreaDom.style.height = "100%";
		this._textAreaDom.style.width = "100%";

		this.setEditorType(sEditorType);

		this._setupToolbar();
	};

	RichTextEditor.prototype.onBeforeRendering = function() {
		this._customToolbarEnablement();

		var oCustomToolbar = this.getAggregation("_toolbarWrapper");

		// if there is a custom toolbar, the toolbar content should be enabled/disabled correspondingly
		if (oCustomToolbar) {
			oCustomToolbar.setToolbarEnabled(this.getEditable(), true);
		}

		if (!this._bCustomToolbarRequirementsFullfiled && this.getCustomToolbar()) {
			Log.warning("Cannot set custom toolbar - not all requirements are fulfilled.");
		}

		if (this.isPropertyInitial("editorType")) {
			Log.info("You are using the default value of the editorType which is subject to changes and might affect your application.");
		}

		this.onBeforeRenderingTinyMCE();
	};

	RichTextEditor.prototype.onAfterRendering = function() {
		this.onAfterRenderingTinyMCE();
	};

	/**
	 * After configuration has changed, this method can be used to trigger a complete re-rendering
	 * that also re-initializes the editor instance from scratch. Caution: this is expensive, performance-wise!
	 *
	 * @private
	 */
	RichTextEditor.prototype.reinitialize = function() {
		// Make sure reinitialization does not happen because several settings are done
		clearTimeout(this._iReinitTimeout);
		this._iReinitTimeout = window.setTimeout(this.reinitializeTinyMCE.bind(this), 0);
	};


	/**
	 * Returns the current editor's instance.
	 * CAUTION: using the native editor introduces a dependency to that editor and breaks the wrapping character of the RichTextEditor control, so it should only be done in justified cases.
	 *
	 * @returns {object} The native editor object (here: The TinyMCE editor instance)
	 * @public
	 */
	RichTextEditor.prototype.getNativeApi = function() {
		return this.getNativeApiTinyMCE();
	};

	RichTextEditor.prototype.exit = function() {
		clearTimeout(this._reinitDelay);
		this.exitTinyMCE();
		RichTextEditor._iCountInstances--;
	};

	RichTextEditor.prototype.setValue = function(sValue) {
		// null and undefined are escaped and stringified with the code below.
		// That's why we need to ensure these are handled properly as empty values
		sValue = (sValue === null || sValue === undefined) ? "" : sValue;

		if (this.getSanitizeValue()) {
			Log.trace("sanitizing HTML content for " + this);
			// images are using the URL validator support
			sValue = sanitizeHTML(sValue);
		}

		if (sValue === this.getValue()) {
			return this;
		}

		this.setProperty("value", sValue, true);
		sValue = this.getProperty("value");
		if (oEditorMapping[this.getEditorType()]) {
			this.setValueTinyMCE(sValue);
		} else {
			this.reinitialize();
		}
		return this;
	};

	// the following setters will work after initial rendering, but can cause a complete re-initialization

	RichTextEditor.prototype.setEditable = function(bEditable) {
		var oCustomToolbar = this.getAggregation("_toolbarWrapper");

		this.setProperty("editable", bEditable, true);

		// if there is a custom toolbar, the toolbar content should be enabled/disabled correspondingly
		if (oCustomToolbar) {
			oCustomToolbar.setToolbarEnabled(bEditable, true);
		}

		this.reinitialize();
		return this;
	};

	RichTextEditor.prototype.setWrapping = function(bWrapping) {
		this.setProperty("wrapping", bWrapping, true);
		this.reinitialize();
		return this;
	};

	RichTextEditor.prototype.setRequired = function(bRequired) {
		this.setProperty("required", bRequired, true);
		this.reinitialize();
		return this;
	};

	/**
	 * Helper function for show/hide of each button group
	 *
	 * @param {boolean} [bShow] Boolean value, indicating if the group should be shown or hidden
	 * @param {object} [mSettings] Settings object
	 * @returns {object} Control instance (for method chaining)
	 * @private
	 */
	RichTextEditor.prototype._setShowGroup = function (bShow, mSettings) {
		var oCustomToolbar = this.getAggregation("_toolbarWrapper");

		this.setProperty(mSettings.property, bShow, true);
		this.setButtonGroupVisibility(mSettings.buttonGroup, bShow);

		if (!oCustomToolbar) {
			this.reinitialize();
			return this;
		}

		oCustomToolbar.setShowGroup(mSettings.buttonGroup, bShow);

		return this;
	};

	RichTextEditor.prototype.setShowGroupFontStyle = function(bShowGroupFontStyle) {
		return this._setShowGroup(bShowGroupFontStyle, {
			property: 'showGroupFontStyle',
			buttonGroup: 'font-style'
		});
	};


	RichTextEditor.prototype.setShowGroupTextAlign = function(bShowGroupTextAlign) {
		return this._setShowGroup(bShowGroupTextAlign, {
			property: 'showGroupTextAlign',
			buttonGroup: 'text-align'
		});
	};

	RichTextEditor.prototype.setShowGroupStructure = function(bShowGroupStructure) {
		return this._setShowGroup(bShowGroupStructure, {
			property: 'showGroupStructure',
			buttonGroup: 'structure'
		});
	};

	RichTextEditor.prototype.setShowGroupFont = function(bShowGroupFont) {
		return this._setShowGroup(bShowGroupFont, {
			property: 'showGroupFont',
			buttonGroup: 'font'
		});
	};

	RichTextEditor.prototype.setShowGroupClipboard = function(bShowGroupClipboard) {
		return this._setShowGroup(bShowGroupClipboard, {
			property: 'showGroupClipboard',
			buttonGroup: 'clipboard'
		});
	};

	RichTextEditor.prototype.setShowGroupInsert = function(bShowGroupInsert) {
		return this._setShowGroup(bShowGroupInsert, {
			property: 'showGroupInsert',
			buttonGroup: 'insert'
		});
	};

	RichTextEditor.prototype.setShowGroupLink = function(bShowGroupLink) {
		return this._setShowGroup(bShowGroupLink, {
			property: 'showGroupLink',
			buttonGroup: 'link'
		});
	};

	RichTextEditor.prototype.setShowGroupUndo = function(bShowGroupUndo) {
		return this._setShowGroup(bShowGroupUndo, {
			property: 'showGroupUndo',
			buttonGroup: 'undo'
		});
	};

	RichTextEditor.prototype.setCustomToolbar = function (bEnabled) {
		// switching the custom toolbar on/off after init may cause performance issues, backward incompatibility
		// and TinyMCE life-cycle management
		if (!this._tinyMCEStatus || this._tinyMCEStatus === EditorStatus.Initial) { // only supported before first rendering!
			this.setProperty("customToolbar", bEnabled);
		} else {
			Log.error("Cannot set customToolbar property to " + bEnabled + " after initialization.", this);
		}

		return this;
	};

	/**
	 * Allows to add a plugin (that must already be installed on the server) to the
	 * RichTextEditor.
	 *
	 * @param {object|string} [mPlugin] The plugin ID/name or an object with property "name", containing the ID/name of the plugin
	 * @returns {sap.ui.richtexteditor.RichTextEditor} Control instance (for method chaining)
	 * @public
	 */
	RichTextEditor.prototype.addPlugin = function (mPlugin) {
		if (typeof mPlugin === "string") {
			mPlugin = {
				name: mPlugin
			};
		}
		var aPlugins = this.getProperty("plugins") || [],
			bIsAlreadyLoaded = aPlugins.some(function (oPlugin) {
				return oPlugin.name === mPlugin.name;
			});

		!bIsAlreadyLoaded && aPlugins.push(mPlugin);

		this.setProperty("plugins", aPlugins);
		this.reinitialize();
		return this;
	};

	/**
	 * Removes the plugin with the given name/ID from the list of plugins to load
	 *
	 * @param {string} [sPluginName] The name/ID of the plugin to remove
	 * @returns {sap.ui.richtexteditor.RichTextEditor} Control instance (for method chaining)
	 * @public
	 */
	RichTextEditor.prototype.removePlugin = function(sPluginName) {
		var aPlugins = this.getProperty("plugins").slice(0);
		for (var i = 0; i < aPlugins.length; ++i) {
			if (aPlugins[i].name === sPluginName) {
				aPlugins.splice(i, 1);
				--i;
			}
		}
		this.setProperty("plugins", aPlugins);

		this.reinitialize();
		return this;
	};

	/**
	 * Adds a button group to the editor.
	 * <b>Note</b>: Adding already existing group will not do anything. If a button group needs to be changed, it first needs to be removed and then added by providing its name or map object, containing its desired configuration.
	 *
	 * @param {object|string} [vGroup] Name/ID of a single button or object containing the group information
	 * @param {string[]}   [vGroup.buttons] Array of name/IDs of the buttons in the group
	 * @param {string}     [vGroup.name] Name/ID of the group.
	 * @param {boolean}    [vGroup.visible=true] (optional) The priority of the button group. Lower priorities are added first.
	 * @param {int}        [vGroup.row=0] (optional) Row number in which the button should be
	 * @param {int}        [vGroup.priority=10] (optional) The priority of the button group. Lower priorities are added first.
	 * @param {int}        [vGroup.customToolbarPriority] (optional) The priority of the button group in the custom toolbar. Each default group in the custom toolbar has a predefined <code>customToolbarPriority</code>. Lower priorities are added in first.
	 * @returns {sap.ui.richtexteditor.RichTextEditor} Control instance (for method chaining)
	 * @public
	 */
	RichTextEditor.prototype.addButtonGroup = function (vGroup) {
		var aGroups = this.getProperty("buttonGroups").slice(),
			oCustomToolbar = this.getAggregation("_toolbarWrapper");

		if (!vGroup) {
			return this;
		}

		// check if the group is already added
		for (var i = 0; i < aGroups.length; ++i) {
			if (typeof vGroup === "string" && aGroups[i].name === vGroup || aGroups[i].name === vGroup.name) {
				Log.warning("Trying to add already existing group: " + (typeof vGroup === "string" ? vGroup : vGroup.name) + ". Please remove the group first and then add it.", this);
				return this;
			}
		}

		// check for the mandatory parameters "vGroup.buttons" and "vGroup.name"
		if (typeof vGroup === "object" && !(vGroup.name && Array.isArray(vGroup.buttons))) {
			Log.error("The properties 'name' and 'buttons' are mandatory for the group configuration object. Please make sure they exist within the provided configuration.", this);
			return this;
		}

		// check buttons in the vGroup.buttons property
		if (typeof vGroup === "object" && !(Array.isArray(vGroup.buttons) && vGroup.buttons.length)) {
			Log.error("The 'buttons' array of the provided group configuration object cannot be empty.", this);
			return this;
		}

		//if vGroup is string and the group name is known to the RTE control, internally we are creating a group object.
		if (typeof vGroup === "string") {
			switch (vGroup) {
				case "formatselect":
					vGroup = {
						name: "formatselect",
						buttons: ["formatselect"]
					};
					break;
				case "styleselect":
					vGroup = {
						name: "styleselect",
						buttons: ["styleselect"],
						customToolbarPriority: 40
					};
					break;
				case "table":
					vGroup = {
						name: "table",
						buttons: ["table"],
						customToolbarPriority: 90
					};
					break;
				// TinyMCE 6
				case "blocks":
					vGroup = {
						name: "blocks",
						buttons: ["blocks"]
					};
					break;
				case "styles":
					vGroup = {
						name: "styles",
						buttons: ["styles"],
						customToolbarPriority: 40
					};
					break;
				default:
					vGroup = {
						name: this._createId("buttonGroup"),
						buttons: [vGroup]
					};
			}
		}

		// Check if any optional configuration parameters are missing
		// and if so - update the group object with their default values.
		this._checkAndUpdateGroupInfo(vGroup);

		var aButtonGroups = this.getButtonGroups();
		aButtonGroups.push(vGroup);
		this.setProperty("buttonGroups", aButtonGroups);

		if (oCustomToolbar) {
			// Provide the new configuration of the group to the custom toolbar
			oCustomToolbar.addButtonGroupToContent(vGroup);
		}

		return this;
	};

	/**
	 * Removes a button group from the editor.
	 *
	 * @param {string} [sGroupName] The name of the group to be removed.
	 * @returns {sap.ui.richtexteditor.RichTextEditor} Control instance (for method chaining)
	 * @public
	 */
	RichTextEditor.prototype.removeButtonGroup = function(sGroupName) {
		var aGroups = this.getProperty("buttonGroups").slice(0),
			oCustomToolbar = this.getAggregation("_toolbarWrapper");

		for (var i = 0; i < aGroups.length; ++i) {
			if (aGroups[i].name === sGroupName) {
				aGroups.splice(i, 1);
				--i;
				oCustomToolbar && oCustomToolbar.removeButtonGroup(sGroupName);
			}
		}
		this.setProperty("buttonGroups", aGroups);

		this.reinitialize();
		return this;
	};

	/**
	 * Sets the button groups to the editor.
	 *
	 * @param {array} [aGroups] Array of names or objects containing the group information
	 * @returns {sap.ui.richtexteditor.RichTextEditor} Control instance (for method chaining)
	 * @public
	 */
	RichTextEditor.prototype.setButtonGroups = function (aGroups) {
		var oCustomToolbar;
		if (!Array.isArray(aGroups)){
			Log.error("Button groups cannot be set: " + aGroups + " is not an array.");
			return this;
		}

		// There are some optional parameters in the groups config, which need to be checked and if not provided
		// set a default values
		aGroups.forEach(this._checkAndUpdateGroupInfo);

		this.setProperty("buttonGroups", aGroups);

		oCustomToolbar = this.getAggregation("_toolbarWrapper");
		if (oCustomToolbar) {
			oCustomToolbar.setButtonGroups(aGroups);
		}

		this.reinitialize();
		return this;

	};

	/**
	 * Checks the group object for optional parameters and adds them with their default values in case they are missing
	 * The properties that this method checks for are (default values are in brackets):
	 * - visible (true)
	 * - priority (10)
	 * - row (0)
	 *
	 * @param {object} oGroup The group object that needs to be checked and modified if needed.
	 */
	RichTextEditor.prototype._checkAndUpdateGroupInfo = function (oGroup) {
		// As those are optional parameters we are adding default values
		// in case the application developers have not done so.
		if (oGroup.visible === undefined) {
			oGroup.visible = true;
		}
		if (oGroup.priority === undefined) {
			oGroup.priority = 10;
		}
		if (oGroup.row === undefined) {
			oGroup.row = 0;
		}
	};

	/**
	 * Sets the plugins to the editor.
	 *
	 * @param {array} [aPlugins] Array of names or objects containing the plugin information
	 * @returns {sap.ui.richtexteditor.RichTextEditor} Control instance (for method chaining)
	 * @public
	 */
	RichTextEditor.prototype.setPlugins = function (aPlugins) {
		var aHasListPlugin = [];
		if (!Array.isArray(aPlugins)){
			Log.error("Plugins cannot be set: " + aPlugins + " is not an array.");
			return this;
		}

		aHasListPlugin = aPlugins.filter(function (oPlugin) {
			return oPlugin.name === "lists";
		});

		// The bullist and numlist properties require 'lists' plugin in order to work properly
		// This is also described in the TinyMCE documentation - https://www.tiny.cloud/docs-4x/plugins/lists/
		if (this.getShowGroupStructure() && !aHasListPlugin.length) {
			aPlugins.push({name: "lists"});
		}

		return this.setProperty("plugins", aPlugins);
	};

	/**
	 * Make the button group with the given name (in)visible (if used before initialization of the editor)
	 *
	 * @param {string} [sGroupName] Name of the group of buttons to be changed
	 * @param {boolean} [bVisible=false] Whether or not this group should be visible
	 * @returns {object} Control instance (for method chaining)
	 * @private
	 */
	RichTextEditor.prototype.setButtonGroupVisibility = function(sGroupName, bVisible) {
		var aButtonGroups = this.getButtonGroups();
		for (var i = 0, iLen = aButtonGroups.length; i < iLen; ++i) {
			if (aButtonGroups[i].name === sGroupName) {
				aButtonGroups[i].visible = bVisible;
			}
		}

		return this;
	};

	/**
	 * Internal method to create unique (to the RTE) IDs
	 *
	 * @param {string} [sPrefix] The string prepended to the unique ID
	 * @returns {string} A unique ID for the editor
	 * @private
	 */
	RichTextEditor.prototype._createId = function(sPrefix) {
		if (sPrefix === undefined) {
			sPrefix = "_rte";
		}

		return sPrefix + (RichTextEditor._lastId++);
	};

	RichTextEditor.prototype._setupToolbar = function () {
		var fnMapPluginList = function (aList) {
			return aList.map(function(item) {
				return { "name": item };
			});
		};

		var mapping = {
			"TinyMCE": fnMapPluginList(RichTextEditor.DEFAULT_PLUGINS_TINYMCE6),
			"TinyMCE4": fnMapPluginList(RichTextEditor.DEFAULT_PLUGINS_TINYMCE5),
			"TinyMCE5": fnMapPluginList(RichTextEditor.DEFAULT_PLUGINS_TINYMCE5),
			"TinyMCE6": fnMapPluginList(RichTextEditor.DEFAULT_PLUGINS_TINYMCE6)
		};

		this.setPlugins(mapping[this.getEditorType()]);

		var fontButtonGroupButtoNamesMapping = {
			"TinyMCE": ["fontfamily", "fontsize", "forecolor", "backcolor"],
			"TinyMCE4": ["fontselect", "fontsizeselect", "forecolor", "backcolor"],
			"TinyMCE5": ["fontselect", "fontsizeselect", "forecolor", "backcolor"],
			"TinyMCE6": ["fontfamily", "fontsize", "forecolor", "backcolor"]
		};

		this.setButtonGroups([{
			name: "font-style",
			visible: this.getShowGroupFontStyle(),
			row: 0,
			priority: 10,
			customToolbarPriority: 20,
			buttons: [
				"bold", "italic", "underline", "strikethrough"
			]
		}, {
			name: "font",
			visible: this.getShowGroupFont(),
			row: 0,
			priority: 30,
			customToolbarPriority: 50,
			buttons: fontButtonGroupButtoNamesMapping[this.getEditorType()]
		}, {
			name: "clipboard",
			visible: this.getShowGroupClipboard(),
			row: 1,
			priority: 10,
			customToolbarPriority: 110,
			buttons: [
				"cut", "copy", "paste"
			]
		}, {
			name: "structure",
			visible: this.getShowGroupStructure(),
			row: 1,
			priority: 20,
			customToolbarPriority: 60,
			buttons: [
				"bullist", "numlist", "outdent", "indent"
			]
		}, {
			name: "undo",
			visible: this.getShowGroupUndo(),
			row: 1,
			priority: 40,
			customToolbarPriority: 100,
			buttons: [
				"undo", "redo"
			]
		}, {
			name: "insert",
			visible: this.getShowGroupInsert(),
			row: 1,
			priority: 50,
			customToolbarPriority: 80,
			buttons: [
				"image", "emoticons"
			]
		}, {
			name: "link",
			visible: this.getShowGroupLink(),
			row: 1,
			priority: 60,
			customToolbarPriority: 70,
			buttons: [
				"link", "unlink"
			]
		}, {
			// Text Align group
			name: "text-align",
			visible: this.getShowGroupTextAlign(),
			row: 0,
			priority: 20,
			customToolbarPriority: 30,
			buttons: [
				"alignleft", "aligncenter", "alignright", "alignjustify"
			]
		}]);
	};

	// the following functions shall not work after the first rendering
	/**
	 * Switches the editor type and sets the default settings for the editor.
	 * All plugins and button groups should be set after this has been invoked
	 *
	 * @param {string} [sEditorType] Which editor type to be used (currently only TinyMCE 4, 5 and 6)
	 * @returns {sap.ui.richtexteditor.RichTextEditor} Control instance (for method chaining)
	 * @public
	 */
	RichTextEditor.prototype.setEditorType = function(sEditorType) {

		if (!this._bEditorCreated) { // only supported before first rendering!
			this.setProperty("editorType", sEditorType);
			sEditorType = this.getEditorType();

			this._setupToolbar();

			if (!oEditorMapping[sEditorType]) {
				Log.error('TinyMCE3 is removed now due to security concerns, please do NOT use it anymore. The framework automatically will load TinyMCE4 since v1.60');
			}

			if (oEditorMapping[sEditorType] === "TinyMCE4") {
				Log.error("TinyMCE version 4 is used as editor. This version is no longer supported by TinyMCE and will be removed in future releases, therefore using it is at your own risk. Please consider upgrading to TinyMCE version 6.");
			} else if (oEditorMapping[sEditorType] === "TinyMCE5") {
				Log.warning("TinyMCE version 5 is used as editor type. TinyMCE 5 will be depreacated with the next stable release of SAPUI5.");
			}

			this.initTinyMCE();
		} else {
			Log.error(
				"editorType property cannot be set after the RichtextEditor has been rendered"
			);
		}

		return this;
	};

	RichTextEditor.prototype.setEditorLocation = function(sEditorLocation) {
		if (!this._bEditorCreated) { // only supported before first rendering!
			this.setProperty("editorLocation", sEditorLocation);
		} else {
			Log.error(
				"editorLocation property cannot be set after the RichtextEditor has been rendered"
			);
		}
		return this;
	};


	/************************************************************************
	 * What now follows is Editor-dependent code
	 *
	 * For other editors create suitable versions of these methods
	 * and attach them to sap.ui.richtexteditor.RichTextEditor.prototype
	 ************************************************************************/

	/////////////////////////// Begin editor section "TinyMCE" (All versions) //////////////////////////

	/**
	 * Creates the ButtonRow for TinyMCE
	 *
	 * @param {string} [sButtonSeparator] Separator that is used to separate button entries
	 * @param {string} [sGroupSeparator]  Separator that is used to separate groups of button entries
	 * @returns {string[]|string} Specific button format. Return an array of strings for TinyMCE 4 and single string for TinyMCE 5
	 * @private
	 */
	RichTextEditor.prototype._createButtonRowsTinyMCE = function(sButtonSeparator, sGroupSeparator) {
		sButtonSeparator = sButtonSeparator === undefined ? "," : sButtonSeparator;
		sGroupSeparator = sGroupSeparator === undefined ? "|" : sGroupSeparator;

		var aButtonGroups = this.getButtonGroups(),
			sGroupSep = sButtonSeparator + sGroupSeparator + sButtonSeparator,
			i, iLen, mGroup,
			aOrderedGroups = {},
			bIsTinyMCE5Or6 = [RichTextEditor.EDITORTYPE_TINYMCE5, RichTextEditor.EDITORTYPE_TINYMCE6, RichTextEditor.EDITORTYPE_TINYMCE].includes(this.getEditorType()),
			sButtonRows = "",
			aButtonRows = [];

		// Order Groups by priority
		for (i = 0, iLen = aButtonGroups.length; i < iLen; ++i) {
			mGroup = aButtonGroups[i];
			if (!aOrderedGroups[mGroup.priority]) {
				aOrderedGroups[mGroup.priority] = [];
			}
			if (mGroup.priority === undefined) {
				mGroup.priority = Number.MAX_VALUE;
			}

			aOrderedGroups[mGroup.priority].push(mGroup);
		}

		// Add Groups in order to the four button rows
		for (var key in aOrderedGroups) {
			for (i = 0, iLen = aOrderedGroups[key].length; i < iLen; ++i) {
				mGroup = aOrderedGroups[key][i];
				var iRow = mGroup.row || 0;

				if (!mGroup.visible || !mGroup.buttons || mGroup.buttons.length === 0) {
					// Do not add empty or invisible groups
					continue;
				}

				if (bIsTinyMCE5Or6) {
					if (!sButtonRows) {
						sButtonRows = "";
					}
					sButtonRows += mGroup.buttons.join(sButtonSeparator) + sGroupSep;
				} else {
					if (!aButtonRows[iRow]) {
						aButtonRows[iRow] = "";
					}
					aButtonRows[iRow] += mGroup.buttons.join(sButtonSeparator) + sGroupSep;
				}
			}
		}

		if (bIsTinyMCE5Or6) {
			return sButtonRows;
		}

		for (i = 0; i < aButtonRows.length; ++i) {
			if (aButtonRows[i] === null) {
				continue;
			} else if (!aButtonRows[i]) {
				aButtonRows.splice(i, 1);
				aButtonRows.push(null);
				continue;
			}

			// Remove trailing group separators
			if (aButtonRows[i].substr(-3) === sGroupSep) {
				aButtonRows[i] = aButtonRows[i].substr(0, aButtonRows[i].length - sGroupSep.length);
			}
			if (aButtonRows[i].substr(-1) === sButtonSeparator) {
				aButtonRows[i] = aButtonRows[i].substr(0, aButtonRows[i].length - sButtonSeparator.length);
			}
			// In case the row is empty, remove it
			if (aButtonRows[i].length === 0) {
				aButtonRows.splice(i, 1);
				aButtonRows.push(null);
			}
		}

		return aButtonRows;
	};

	/**
	 * Creates the ButtonRow strings for TinyMCE
	 *
	 * @returns {string} Plugin string specifically formatted for TinyMCE
	 * @private
	 */
	RichTextEditor.prototype._createPluginsListTinyMCE = function() {
		var aPlugins = this.getPlugins(),
			aPluginNames = [];

		for (var i = 0, iLen = aPlugins.length; i < iLen; ++i) {
			aPluginNames.push(aPlugins[i].name);
		}
		return aPluginNames.join(",");
	};

	/**
	 * Event handler being called when the text in the editor has changed
	 *
	 * @param {tinymce.Editor} [oCurrentInst] The current editor instance (tinymce native API)
	 * @returns {void}
	 * @private
	 */
	RichTextEditor.prototype.onTinyMCEChange = function(oCurrentInst) {
		var sPrevValue = this.getValue(),
			sContent = oCurrentInst.getContent(),
			sNewValue = this.getSanitizeValue() ? sanitizeHTML(sContent) : sContent;

		if ((sPrevValue !== sNewValue) && !this.bExiting) {
			this.setProperty("value", sNewValue, true); // suppress rerendering
			this.fireChange({ oldValue: sPrevValue, newValue: sNewValue });
		}
	};

	//////////////////////////// End editor section "TinyMCE" (All versions) ///////////////////////////

	////////////////////////////////// Begin editor section "TinyMCE" /////////////////////////////////


	/**
	 * Called when the editor type is set to TinyMCE
	 *
	 * @private
	 */
	RichTextEditor.prototype.initTinyMCE = function() {
		// TinyMCE instance
		this._oEditor = null;

		// Status of the TinyMCE component
		this._tinyMCEStatus = EditorStatus.Initial;

		// Bound resize method, so it can be given to the Resizehandler with correct this-reference
		this._boundResizeEditorTinyMCE = this._resizeEditorTinyMCE.bind(this);

		// If initialization is currently pending, but has not yet been requested from TinyMCE, we ca avoid calling
		// it again without any changes
		this._bInitializationPending = false;

		// make sure the first resize actually does something
		this._lastRestHeight = 0;
	};

	/**
	 * Called when the editor type is set from TinyMCE to something else or the control is destroyed
	 *
	 * @private
	 */
	RichTextEditor.prototype.exitTinyMCE = function() {
		this._bUnloading = true;

		ResizeHandler.deregister(this._resizeHandlerId);
		this._resizeHandlerId = null;

		this._removeEditorTinyMCE();
	};

	/**
	 * @private
	 */
	RichTextEditor.prototype._removeEditorTinyMCE = function() {
		switch (this._tinyMCEStatus) {
			case EditorStatus.Initial:
			case EditorStatus.Loading:
			case EditorStatus.Loaded:
				// Ignored as the control is not rendered yet.
				break;

			case EditorStatus.Initializing:
				this._pTinyMCEInitialized.then(this._removeEditorTinyMCE.bind(this, this._oEditor));
				break;

			case EditorStatus.Ready:
				this._oEditor.remove();
				this._tinyMCEStatus = EditorStatus.Destroyed;
				this._boundResizeEditorTinyMCE = null;
				this._oEditor = null;
				break;

			case EditorStatus.Destroyed:
				// Ignored as the editor is already destroyed.
				break;
			default:
				Log.error("Unknown TinyMCE status: " + this._tinyMCEStatus);
				break;
		}
	};

	/**
	 * Determines if a new TinyMCE instance should be loaded.
	 * @private
	 * @returns {boolean} Whether tinyMCE should be loaded.
	 */
	RichTextEditor.prototype._shouldLoadTinyMCE = function () {
		var sEditorType = this.getEditorType();

		if (!window.tinymce) {
			return true;
		}

		switch (sEditorType) {
			case RichTextEditor.EDITORTYPE_TINYMCE4:
				return window.tinymce.majorVersion != "4";
			case RichTextEditor.EDITORTYPE_TINYMCE5:
				return window.tinymce.majorVersion != "5";
			case RichTextEditor.EDITORTYPE_TINYMCE6:
				return window.tinymce.majorVersion != "6";
			default:
				return false;
		}
	};

	/**
	 * @private
	 */
	RichTextEditor.prototype.onBeforeRenderingTinyMCE = function() {
		if (this._shouldLoadTinyMCE()) {
			// fallback to tinymce 4 for now since the editorLocation property used to do so
			var sEditorLocation = EDITOR_LOCATION_MAPPING[this.getEditorType()] || EDITOR_LOCATION_MAPPING[RichTextEditor.EDITORTYPE_TINYMCE4];
			// Load TinyMCE component
			this._tinyMCEStatus = EditorStatus.Loading;
			this._pTinyMCELoaded = RichTextEditor.loadTinyMCE(sEditorLocation).then(function() {
				this._tinyMCEStatus = EditorStatus.Loaded;
			}.bind(this));
		} else {
			this._pTinyMCELoaded = Promise.resolve();
			this._tinyMCEStatus = EditorStatus.Loaded;
		}
	};

	/**
	 * @private
	 */
	RichTextEditor.prototype.onAfterRenderingTinyMCE = function() {
		var oDomRef = this.getDomRef();

		if (this._shouldLoadTinyMCE()) {
			// TinyMCE not loaded yet. try again later...
			this._pTinyMCELoaded.then(this.onAfterRenderingTinyMCE.bind(this));
		} else if (oDomRef) {

			switch (this._tinyMCEStatus) {
				case EditorStatus.Initializing:
					oDomRef.appendChild(this._textAreaDom);
					break;
				case EditorStatus.Loaded:
				case EditorStatus.Loading:
					this.getDomRef().appendChild(this._textAreaDom);
					this.reinitializeTinyMCE();
					break;
				case EditorStatus.Ready:
					// We need to reinitialize TinyMCE so changes will be shown.
					oDomRef.appendChild(this._textAreaDom);
					this.reinitializeTinyMCE();
					break;

				default:
					Log.error("Unknown TinyMCE status: " + this._tinyMCEStatus);
					break;
			}
		}
	};


	/**
	 * TinyMCE specific reinitialize method
	 * The TinyMCE instance is destroyed and recreated with new configuration values.
	 *
	 * @private
	 */
	RichTextEditor.prototype.reinitializeTinyMCE = function() {
		if (this._bInitializationPending || this._bUnloading) {
			// Do nothing if an initialization is currently waiting to happen or if the control has already been destroyed...
			return;
		}

		var fnReinitialize = function() {

			if (this._oEditor) {
				this._oEditor.remove();
			}

			this._initializeTinyMCE();
		}.bind(this);

		switch (this._tinyMCEStatus) {
			case EditorStatus.Initial:
				// Ignored as the control is not rendered yet.
				break;

			case EditorStatus.Loading:
				this._bInitializationPending = true;
				this._pTinyMCELoaded.then(fnReinitialize);
				break;

			case EditorStatus.Initializing:
				// We are currently waiting for the initialization of TinyMCE to complete, we have to do it again to
				// make sure the latest changes will be reflected
				this._bInitializationPending = true;
				this._pTinyMCEInitialized.then(fnReinitialize);
				break;

			case EditorStatus.Loaded:
			case EditorStatus.Ready:
				this._bInitializationPending = true;
				// Makes sure that all other started reinitializations are completed, before the next one starts. The RTE is crashing in IE11 and Edge browser without that extra timeout.
				setTimeout(function() {
					fnReinitialize();
				}, 0);
				break;

			default:
				Log.error("Unknown TinyMCE status: " + this._tinyMCEStatus);
				break;
		}
	};

	/**
	 * TinyMCE specific getNativeApi method
	 * Returns the editor instance for this control instance if available
	 *
	 * <b>Note:</b> This is the only official way of accessing TinyMCE. Accessing the third-party API through
	 * the window object may lead to backward incompatibility with later updates. Such cases will not be supported.
	 *
	 * @returns {object} The TinyMCE editor instance
	 * @private
	 */
	RichTextEditor.prototype.getNativeApiTinyMCE = function() {
		return this._oEditor;
	};

	/**
	 * TinyMCE specific setValue method
	 * Loads the content set in the controls property into the TinyMCE editor instance and does
	 * the necessary post processing
	 *
	 * @param {string} [sValue] Content, already sanitized if sanitizer is activated
	 * @private
	 */
	RichTextEditor.prototype.setValueTinyMCE = function(sValue) {

		switch (this._tinyMCEStatus) {
			case EditorStatus.Initial:
			case EditorStatus.Initializing:
			case EditorStatus.Loading:
				// Ignored - value will be set when TinyMCE is ready
				break;

			case EditorStatus.Ready:
				this._oEditor.setContent(sValue);
				//Reset the undo manager
				this._oEditor.undoManager.clear();
				this._oEditor.undoManager.add();

				// if running in readonly mode, update link targets to _blank
				if (!this.getEditable()) {
					jQuery.each(this._oEditor.getDoc().getElementsByTagName("a"), function(i, oAnchor) {
						oAnchor.target = "_blank";
					});
				}
				break;

			default:
				Log.error("Unknown TinyMCE status: " + this._tinyMCEStatus);
				break;
		}
	};


	RichTextEditor.prototype._initializeTinyMCE = function() {
		this._pTinyMCEInitialized = new Promise(function(fnResolve, fnReject) {
			this._bInitializationPending = false;
			this._tinyMCEStatus = EditorStatus.Initializing;
			this._textAreaDom.value = this._patchTinyMCEValue(this.getValue());
			window.tinymce.init(this._createConfigTinyMCE(function() {
				this._tinyMCEStatus = EditorStatus.Ready;
				// Wee need to add a timeout here, as the promise resolves before other asynchronous tasks like the
				// load-events, which leads to TinyMCE still trying to operate on its DOM after the promise is resolved.
				setTimeout(function() {
					if (!this._bInitializationPending) {
						this._onAfterReadyTinyMCE();
					}
					fnResolve();
				}.bind(this), 0);
			}.bind(this)));
		}.bind(this));
	};

	/**
	 * Patches the value which would be inserted in TinyMCE.
	 *
	 * If the value starts with an HTML comment, then tinyMCE
	 * throws an exception and its init hook is not executed.
	 *
	 * TODO: Check if this is fixed with higher version of TinyMCE and remove the patch
	 *
	 * @param {string} value The value which will be inserted in the TinyMCE
	 * @returns {string} The patched value
	 * @private
	 */
	RichTextEditor.prototype._patchTinyMCEValue = function (value) {
		if (value.indexOf("<!--") === 0) {
			value = "&#8203;" + value; // Prepend the value with "ZERO WIDTH NO-BREAK SPACE" character
		}

		return value;
	};


	/**
	 * Sets up the TinyMCE instance after it has been loaded, initialized and shown on the
	 * page.
	 *
	 * @private
	 */
	RichTextEditor.prototype._onAfterReadyTinyMCE = function() {
		var oEditorIFrame = document.getElementById(this._iframeId),
			oCustomToolbar = this.getAggregation("_toolbarWrapper"),
			oToolbarDOM = oCustomToolbar && oCustomToolbar.getAggregation("_toolbar").getDomRef(),
			oResourceBundle = Core.getLibraryResourceBundle("sap.ui.richtexteditor");

		// ARIA
		if (oEditorIFrame) {
			oEditorIFrame.setAttribute("aria-labelledby", this.getAriaLabelledBy().join(" "));
		}

		if (this._bUnloading) {
			// This only happens when the control instance is destroyed in the meantime...
			return;
		}

		// First scenario - desktop - will always remove the hidden class
		// or
		// Second scenario - will remove the hidden class if mobile property is not set
		//   - the toolbar is always hidden on mobile device if the configuration is set
		if (this._tinyMCEDesktopDetected() || !this._bHasNativeMobileSupport) {
			oCustomToolbar && oCustomToolbar.getAggregation("_toolbar").removeStyleClass("sapUiHidden");
		}

		this._oEditor.on("change", function(oEvent) {
			this.onTinyMCEChange(this._oEditor); // Works for TinyMCE 4 and 5
		}.bind(this));

		/* Save the editor's state after the custom toolbar is initialized in order to enable proper firing of a 'dirty'
		event - a native TinyMCE event that is fired on every single change done in the editor.

		When we initialize the customToolbar, setDirty method of TinyMCE is called many times, as a result of
		executing the default font styles to ensure right synchronizing of the custom toolbar in ToolbarWrapper.prototype.modifyRTEToolbarConfig.

		As a result when we have custom toolbar used, initally it is always "dirty" and the event is not fired on content change.
		Saving the content initially  will "clean" the state, allowing the app to use the native TinyMCE dirty event.

		Event is not fired when the whole content is selected via CTRL + A and deleted. That is a TinyMCE issue.*/
		if (this.getCustomToolbar()) {
			this._oEditor.save();
		}

		// Make sure focus event is triggered, when body inside the iframe is focused
		var $EditorIFrame = jQuery(oEditorIFrame),
			$Body = jQuery(this._oEditor.getBody()),
			bTriggered = false;

		$Body.on('focus', function() {
			if (!bTriggered) {
				bTriggered = true;
				/* TODO remove after 1.62 version */
				$EditorIFrame.trigger('focus');
				$Body.trigger('focus');
				bTriggered = false;
			}
		});

		if (this.getTooltip() && this.getTooltip().length > 0) {
			var sTooltip = this.getTooltip_Text();
			this._oEditor.getBody().setAttribute("title", sTooltip);
			$EditorIFrame.attr("title", sTooltip);
		}
		this._registerWithPopupTinyMCE();

		// Handle resized correctly.
		if (!this._resizeHandlerId) {
			this._resizeHandlerId = ResizeHandler.register(this, this._boundResizeEditorTinyMCE);
		}

		this._resizeEditorOnDocumentReady();

		if (oToolbarDOM) {
			oToolbarDOM.setAttribute("aria-roledescription", oResourceBundle.getText("CUSTOM_TOOLBAR_ARIA_ROLEDESCRIPTION"));
		}

		this._oEditor.getContainer().classList.add("sapUiRteEditorContainer");

		// TODO: make sure ready is fired if no reinitializations are pending
		this.fireReadyTinyMCE();
	};

	RichTextEditor.prototype._resizeEditorOnDocumentReady = function() {
		var fnResizeEditor = this._resizeEditorTinyMCE.bind(this);
		// Resize when editor is loaded completely
		var oEditorDocument = this._oEditor.getDoc();

		if (!oEditorDocument) {
			return;
		}

		if (oEditorDocument.readyState == "complete") {
			fnResizeEditor();
		} else {
			oEditorDocument.addEventListener("readystatechange", function() {
				if (oEditorDocument.readyState == "complete") {
					fnResizeEditor();
				}
			});
		}
	};


	/**
	 * Checks native TinyMCE desktop detection
	 *
	 * @private
	 */
	RichTextEditor.prototype._tinyMCEDesktopDetected = function() {
		return window.tinymce && window.tinymce.Env.desktop;
	};

	/**
	 * Fires the ready event, but only once per instance. Subsequent calls to this method are ignored
	 *
	 * @private
	 */
	RichTextEditor.prototype.fireReadyTinyMCE = function() {
		switch (this._tinyMCEStatus) {
			case EditorStatus.Initial:
			case EditorStatus.Loading:
			case EditorStatus.Loaded:
			case EditorStatus.Initializing:
				// Ignored - will be called again after TinyMCE initialization
				break;

			case EditorStatus.Ready:
				if (!this._bInitializationPending) {
					if (!this._readyFired){
						this._readyFired = true;
						this.fireReady.apply(this, arguments);
					}
					this.fireReadyRecurring.apply(this, arguments);
				}
				break;

			default:
				Log.error("Unknown TinyMCE status: " + this._tinyMCEStatus);
				break;
		}
	};

	/**
	 * Helper function for evaluating the textDirection of the tinyMCE's content config
	 *
	 * @returns {string} Text direction
	 * @private
	 */
	RichTextEditor.prototype._getTextDirection = function() {
		// use the global config if no textDirection is specified
		if (this.getTextDirection() === this.getMetadata().getProperty("textDirection").getDefaultValue()) {
			return Core.getConfiguration().getRTL() ? "rtl" : "ltr";
		} else {
			return this.getTextDirection().toLowerCase();
		}
	};

	/**
	 * Creates the configuration object which is used to initialize the tinymce editor instance
	 *
	 * @param {function} fnOnInit is a callback which is called on init
	 * @returns {boolean} Whether the configuration changed since last time
	 * @private
	 */
	RichTextEditor.prototype._createConfigTinyMCE = function(fnOnInit) {
		var oCustomToolbar = this.getAggregation("_toolbarWrapper");

		// Create new instance of TinyMCE
		var aButtonRows = this._createButtonRowsTinyMCE(" ", "|");
		if (aButtonRows.length === 0) {
			aButtonRows = false;
		}

		var sPluginsList = this._createPluginsListTinyMCE();

		// Disable PowerPaste when the editor should be disabled.
		// PowerPaste enables pasting in the editor even in read-only mode
		if (!this.getEditable()) {
			sPluginsList = sPluginsList.replace(/(,powerpaste|powerpaste,)/gi, "");
		}

		var bIsTinyMCE5Or6 = [RichTextEditor.EDITORTYPE_TINYMCE5, RichTextEditor.EDITORTYPE_TINYMCE6, RichTextEditor.EDITORTYPE_TINYMCE].includes(this.getEditorType());
		var bIsTinyMCE6 = this.getEditorType() === RichTextEditor.EDITORTYPE_TINYMCE6 || this.getEditorType() === RichTextEditor.EDITORTYPE_TINYMCE;

		// since TinyMCE 6 plugins property format has changed
		if (bIsTinyMCE6) {
			sPluginsList = this.getPlugins().map(function(oPlugin) {
				return oPlugin.name;
			});
		}

		if (bIsTinyMCE6 && !this.getEditable()) {
			sPluginsList = sPluginsList.filter(function(oPlugin) {
				return oPlugin !== "powerpaste";
			});
		}

		/*eslint-disable camelcase */
		var oConfig = {
			// The following line only covers the editor content, not the UI in general
			height: "calc(100% - var(--_sap_ui_richtexteditor__toolbar_height))",
			directionality: this._getTextDirection(),
			selector: "[id='" + this._textAreaId + "']",
			theme: bIsTinyMCE5Or6 ? "silver" : "modern",
			menubar: false,
			language: this._getLanguageTinyMCE(),
			browser_spellcheck: true,
			convert_urls: false,
			plugins: sPluginsList,
			contextmenu: false,
			toolbar_items_size: 'small',
			toolbar: aButtonRows,
			toolbar_mode: "sliding",
			statusbar: false, // disables display of the status bar at the bottom of the editor
			image_advtab: true, // Adds an "Advanced" tab to the image dialog allowing you to add custom styles, spacing and borders to images
			readonly: !this.getEditable(),
			nowrap: !this.getWrapping(),
			init_instance_callback: function(oEditor) {
				this._oEditor = oEditor;
				fnOnInit();
			}.bind(this),
			setup: function(editor) {
				editor.on('Init', function() {
					if (this.editorManager.majorVersion === "4") {
						editor.schema.getSpecialElements()['iframe'] = new RegExp('</iframe[^>]*>', 'gi');
					}
				});
			}
		};
		/*eslint-enable camelcase */

		// apply setup for RichTextEditor with Custom Toolbar}
		if (this._bCustomToolbarRequirementsFullfiled && oCustomToolbar) {
			oConfig = oCustomToolbar.modifyRTEToolbarConfig(oConfig);
		}

		// Hook to allow apps to modify the editor configuration directly before first creation
		this.fireBeforeEditorInit({ configuration: oConfig });

		this._bHasNativeMobileSupport = oConfig.mobile;

		return oConfig;
	};


	/**
	 * Map languages that are incorrectly assigned or fallback if languages do not work
	 * TODO: Change this when more languages are supported by TinyMCE
	 *
	 * @returns {string} The language to be used for TinyMCE
	 */
	RichTextEditor.prototype._getLanguageTinyMCE = function() {
		var oLocale = new Locale(Core.getConfiguration().getLanguage()),
			sLanguage = oLocale.getLanguage(),
			sRegion = oLocale.getRegion(),
			bIsTinyMCE5Or6 = [RichTextEditor.EDITORTYPE_TINYMCE5, RichTextEditor.EDITORTYPE_TINYMCE6, RichTextEditor.EDITORTYPE_TINYMCE].includes(this.getEditorType()),
			bIsTinyMCE6 = this.getEditorType() === RichTextEditor.EDITORTYPE_TINYMCE6 || this.getEditorType() === RichTextEditor.EDITORTYPE_TINYMCE,
			sLangStr;

		// Language mapping for old/fallback languages
		sLanguage = RichTextEditor.MAPPED_LANGUAGES_TINYMCE[sLanguage] || sLanguage;

		// Find default region, if region is not given
		if (!sRegion) {
			sRegion = bIsTinyMCE6 ?  RichTextEditor.SUPPORTED_LANGUAGES_DEFAULT_REGIONS_TINYMCE6[sLanguage] : RichTextEditor.SUPPORTED_LANGUAGES_DEFAULT_REGIONS[sLanguage];
		}

		sLangStr = sRegion ? sLanguage + "_" + sRegion.toUpperCase() : sLanguage;

		// If there is region language, return it
		if (RichTextEditor.SUPPORTED_LANGUAGES_TINYMCE[sLangStr]) {
			return sLangStr;
		}

		if (bIsTinyMCE5Or6) {
			// If there is region language in the additional languages supported in TinyMCE5, return it
			if (RichTextEditor.SUPPORTED_LANGUAGES_TINYMCE5[sLangStr]) {
				return sLangStr;
			}

			// If there is language in the additional languages supported in TinyMCE5, return it
			if (RichTextEditor.SUPPORTED_LANGUAGES_TINYMCE5[sLanguage]) {
				return sLanguage;
			}
		}

		// If there is a some language, return it
		if (RichTextEditor.SUPPORTED_LANGUAGES_TINYMCE[sLanguage]) {
			return sLanguage;
		}

		// If there is still no language defined, fallback to english
		return "en";
	};

	/**
	 * Resizes the inner TinyMCE DOM to fit into the controls DOM element
	 *
	 * @returns {void}
	 * @private
	 */
	RichTextEditor.prototype._resizeEditorTinyMCE = function() {
		// Resize so the full editor takes the correct height

		if (this._tinyMCEStatus !== EditorStatus.Ready) {
			// This only happens when the control instance is destroyed in the meantime...
			return;
		}

		var oEditorContentDom = this._oEditor.getContentAreaContainer(),
			iFullHeight = this.getDomRef().offsetHeight,
			iContainerHeight = this._oEditor.getContainer().offsetHeight,
			iContentHeight = oEditorContentDom.offsetHeight,
			oCustomToolbar = this.getAggregation("_toolbarWrapper"),
			iCustomToolbarHeight,
			iRestHeight,
			iDifference;

		// if there is a custom toolbar substract the height from the editor height
		iCustomToolbarHeight = oCustomToolbar ? oCustomToolbar.getAggregation("_toolbar").getDomRef().offsetHeight : "0";

		iRestHeight = iFullHeight - (iContainerHeight - iContentHeight) - iCustomToolbarHeight;

		// There is a border of 1 px around the editor, which screws up the size determination when used the combination
		// of a 100%-sized editor and an auto-sized dialog. In this case the border leads to end endless loop of resize
		// events that lead to an ever growing dialog.
		// So only trigger a resize if the size difference is actually noticable. In case the difference is 0, the resize
		// call is needed because TinyMCE does not always actually resize when the resizeTo method is called.
		// There should be a better solution to this problem...
		iDifference = Math.abs(this._lastRestHeight - iRestHeight);
		if (iDifference == 0 || iDifference > 5) {
			try {
				// the substraction of the result height is needed because of the
				// border bottom and border top (1px each) - otherwise they are being cut off
				this._oEditor.theme.resizeTo(undefined, iRestHeight - 2);
			} catch (ex) {
				// In some cases this leads to exceptions in IE11 after a current security fix. These cases can be safely ignored.
			}
		}

		this._lastRestHeight = iRestHeight;
	};



	/**
	 * Publish addFocusableContent event to make the editor iframe and internal iframes of TinyMCE known
	 * to the popup (if contained in one) for focus handling. Needs to be done asynchronously, as the
	 * data-sap-ui-popup property is set in the onAfterRendering of the popup which occurs after the
	 * onAfterRendering of its content. For more info see sap.ui.core.Popup documentation
	 *
	 * @private
	 */
	RichTextEditor.prototype._registerWithPopupTinyMCE = function() {
		var oBus = Core.getEventBus(),
		bIsTinyMCE5Or6 = [RichTextEditor.EDITORTYPE_TINYMCE5, RichTextEditor.EDITORTYPE_TINYMCE6, RichTextEditor.EDITORTYPE_TINYMCE].includes(this.getEditorType()),
			$Pop = this.$().closest("[data-sap-ui-popup]");

		setTimeout(function() {
			if ($Pop.length === 1) {
				var sPopupId = $Pop.attr("data-sap-ui-popup"),
					sDialogId = "tox-dialog-" + this.getId(),
					oObject = { id: this._iframeId };

				oBus.publish("sap.ui", "sap.ui.core.Popup.addFocusableContent-" + sPopupId, oObject);

				if (this._oEditor) {
					this._oEditor.on('OpenWindow', function(oEvent) {
						if (bIsTinyMCE5Or6) { // sets our own id to the newly created dialog, because in TinyMCE5 doesn't set id
							jQuery(".tox-dialog[role='dialog']").attr("id", sDialogId);
						}
						var oObject = { id: bIsTinyMCE5Or6 ? sDialogId : oEvent.win._id};
						oBus.publish("sap.ui", "sap.ui.core.Popup.addFocusableContent-" + sPopupId, oObject);
					});
					this._oEditor.on('CloseWindow', function(oEvent) {
						var oObject = { id: bIsTinyMCE5Or6 ? sDialogId : oEvent.win._id};
						oBus.publish("sap.ui", "sap.ui.core.Popup.removeFocusableContent-" + sPopupId, oObject);
						if (bIsTinyMCE5Or6) {
							jQuery(".tox-dialog[role='dialog']").attr("id"); // remove our id
						}
					});
				}
			}
		}.bind(this), 0);
	};
	////////////////////////////////// End editor section "TinyMCE" /////////////////////////////////


	////////////////////////////////// Custom Toolbar Section  /////////////////////////////////

	/**
	 * Checks Custom Toolbar dependencies
	 *
	 * @returns {boolean} True if the requirements for using the custom toolbar are fulfilled
	 * @private
	 */
	RichTextEditor.prototype._checkCustomToolbarRequirements = function() {
		var bRequirementsFullfiled = this.getCustomToolbar() && oEditorMapping[this.getEditorType()] && library.RichTextEditorHelper.bSapMLoaded;

		this.$().toggleClass("sapUiRTEWithCustomToolbar", bRequirementsFullfiled);

		return bRequirementsFullfiled;
	};

	/**
	 * Manage Custom Toolbar lifecycle.
	 *
	 * As RichTextEditor's "customButtons" aggregation is just a proxy to the Toolbar's content,
	 * we need to take care of it manually.
	 * When the toolbar is created, the "customButtons" aggregation items are moved to the Toolbar,
	 * but if the Toolbar is destroyed, we need to move the items back to the RTE's aggregation.
	 * Therefore switching customToolbar on/off would produce the same output.
	 *
	 * @private
	 */
	RichTextEditor.prototype._customToolbarEnablement = function () {
		var aCustomButtons,
			oToolbarWrapper = this.getAggregation("_toolbarWrapper");

		this._bCustomToolbarRequirementsFullfiled = this._checkCustomToolbarRequirements();

		if (this._bCustomToolbarRequirementsFullfiled && !oToolbarWrapper) {
			aCustomButtons = this.getAggregation("customButtons"); // Take items from RichTextEditor's aggregation
			this.removeAllAggregation("customButtons"); // Detach custom buttons from the RTE before moving them to the Toolbar
			oToolbarWrapper = new ToolbarWrapper({editor: this});

			this.setAggregation("_toolbarWrapper", oToolbarWrapper);

			// Needed to await the '_toolbar' aggregation to be available
			setTimeout(function () {
				var oToolbar = oToolbarWrapper.getAggregation("_toolbar");
				oToolbar && oToolbar.addStyleClass("sapUiHidden");
			}, 0);

			if (aCustomButtons && aCustomButtons.length) {
				// The delayedCall is needed as the ToolbarWrapper is not yet ready.
				setTimeout(function () {
					aCustomButtons.forEach(function (oButton) {
						oToolbarWrapper.modifyToolbarContent("add", oButton);
					});
				}, 0);
			}
		}
	};

	/**
	 * Overwrite customButton getters and setters and proxy that aggregation to the toolbar
	 */
	["add", "destroy", "get", "indexOf", "insert", "removeAll", "remove"].forEach(function (sMethodPrefix) {
		var sMethodName = sMethodPrefix + "CustomButton" +
			(["destroy", "get", "removeAll"].indexOf(sMethodPrefix) > -1 ? "s" : "");
		var bChainable = /^(add|insert|destroy)/.test(sMethodPrefix);

		RichTextEditor.prototype[sMethodName] = function () {
			var vResult = null,
				oItem = arguments[0],
				oToolbarWrapper = this.getAggregation("_toolbarWrapper");

			// As we can't limit the aggregation type to sap.m.Button, the check should be performed manually
			if (typeof oItem === "object" && oItem.getMetadata().getName() !== "sap.m.Button") {
				Log.error("Only sap.m.Button is allowed as aggregation.");
				return bChainable ? this : undefined;
			}

			if (oToolbarWrapper && oToolbarWrapper.modifyToolbarContent) {
				vResult = oToolbarWrapper.modifyToolbarContent.bind(oToolbarWrapper, sMethodPrefix).apply(oToolbarWrapper, arguments);
			} else {
				vResult = this[sMethodPrefix + "Aggregation"].bind(this, "customButtons").apply(this, arguments);
			}

			return bChainable ? this : vResult;
		};
	});
	////////////////////////////////// END Custom Toolbar Section  /////////////////////////////////

	return RichTextEditor;

});
