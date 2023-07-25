/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides control sap.ui.comp.navpopover.LinkData.
sap.ui.define(['sap/ui/comp/library', 'sap/ui/core/Element'], function(library, Element) {
	"use strict";

	/**
	 * Constructor for a new navpopover/LinkData.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Stores display text together with a navigation target hyperlink.<br>
	 *        The LinkData class is used by {@link sap.ui.comp.navpopover.SmartLink SmartLink} and
	 *        {@link sap.ui.comp.navpopover.SemanticObjectController SemanticObjectController} to define the visible links on
	 *        {@link sap.ui.comp.navpopover.NavigationPopover NavigationPopover}.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @since 1.28.0
	 * @alias sap.ui.comp.navpopover.LinkData
	 */
	var LinkData = Element.extend("sap.ui.comp.navpopover.LinkData", /** @lends sap.ui.comp.navpopover.LinkData.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			properties: {

				/**
				 * Text which can be displayed on the UI
				 */
				text: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Destination link for a navigation operation in external format using the <code>hrefForExternal</code> method of the CrossApplicationNavigation service.
				 */
				href: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Destination link for a navigation operation in internal format provided by FLP.
				 * Only for internal use in the NavigationPopoverHandler
				 * @protected
				 */
				internalHref: {
					type: "string",
					defaultValue: null
				},

				/**
				 * The standard values for the <code>target</code> property are: _self, _top, _blank, _parent, _search. Alternatively, a frame name
				 * can be entered. This property is only used if the <code>href</code> property is set.
				 */
				target: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Description of the link.
				 * @since 1.42.0
				 */
				description: {
					type: "string",
					defaultValue: undefined
				},

				/**
				 * Describes whether the link should be visible on the screen.
				 * @since 1.44.0
				 */
				visible: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Key of link.
				 * @since 1.44.0
				 */
				key: {
					type: "string",
					defaultValue: undefined
				},

				/**
				 * Callback for <code>press</code> event.
				 * @since 1.46.0
				 */
				press: {
					type: "object",
					defaultValue: null
				},

				/**
				 * Marker for superior action.
				 * @since 1.48.0
				 */
				isSuperiorAction: {
					type: "boolean"
				},
				/**
				 * Describes whether the visibility is changed by end user or not.
				 * @since 1.58.0
				 */
				visibleChangedByUser: {
					type: "boolean"
				}
			}
		}
	});

	LinkData.prototype.getJson = function() {
		return {
			key: this.getKey(),
			href: this.getHref(),
			internalHref: this.getInternalHref(),
			text: this.getText(),
			target: this.getTarget(),
			description: this.getDescription(),
			visible: this.getVisible(),
			press: this.getPress(),
			isSuperiorAction: this.getIsSuperiorAction()
		};
	};

	LinkData.convert2Json = function(aLinkDatas) {
		return aLinkDatas.map(function(oLinkData) {
			return oLinkData.getJson();
		});
	};

	return LinkData;

});