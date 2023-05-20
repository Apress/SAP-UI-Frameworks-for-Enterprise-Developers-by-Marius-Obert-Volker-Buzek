/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(['./library', 'sap/ui/core/Control', './UnifiedThingGroupRenderer'],
	function(library, Control, UnifiedThingGroupRenderer) {
	"use strict";

	/**
	 * Constructor for a new UnifiedThingGroup.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control is used in UnifiedThingInspector to display the facet header information.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Object page should be used instead.
	 * @alias sap.suite.ui.commons.UnifiedThingGroup
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UnifiedThingGroup = Control.extend("sap.suite.ui.commons.UnifiedThingGroup", /** @lends sap.suite.ui.commons.UnifiedThingGroup.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * The title of the group.
				 */
				title: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The description of the group.
				 */
				description: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Defines how the control is rendered.
				 */
				design: {
					type: "sap.suite.ui.commons.ThingGroupDesign",
					group: "Misc",
					defaultValue: "ZeroIndent"
				}
			},
			aggregations: {
				/**
				 * The content of the group.
				 */
				content: {type: "sap.ui.core.Control", multiple: false}
			}
		}
	});

	return UnifiedThingGroup;
});