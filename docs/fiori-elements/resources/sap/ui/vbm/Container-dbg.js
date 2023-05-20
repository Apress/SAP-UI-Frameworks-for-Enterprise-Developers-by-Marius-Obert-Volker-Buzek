/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Container.
sap.ui.define([
	"./VoBase",
	"./library"
], function(VoBase, library) {
	"use strict";

	/**
	 * Constructor for a new Container.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Specific Visual Object element acting as a container for other controls. A Container is positioned at the given position on the map. It
	 *        can aggregate other controls, which will then move with the map.<br>
	 *        <b>Since a Container is not a real visual object most features borrowed from <i>VoBase</i> will not work. There is no label, no edit
	 *        mode, and no drop support. Events like click will only be fired if the aggregated control is not handling them.</b>
	 * @extends sap.ui.vbm.VoBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Container
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Container = VoBase.extend("sap.ui.vbm.Container", /** @lends sap.ui.vbm.Container.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The position for the Container. The format is "lon;lat;0".
				 */
				position: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Alignment of the container to its position:
				 * <ul>
				 * <li>0: center
				 * <li>1: top center
				 * <li>2: top right
				 * <li>3: center right
				 * <li>4: bottom right
				 * <li>5: bottom center
				 * <li>6: bottom left
				 * <li>7: center left
				 * <li>8: top left
				 * </ul>
				 */
				alignment: {
					type: "string",
					group: "Misc",
					defaultValue: '0'
				}
			},
			aggregations: {

				/**
				 * The control that should be placed in the container.
				 */
				item: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.Container.prototype.init = function(){
	// // do something for initialization...
	// };
	
	// Implement function defined in VoBase
	Container.prototype.openContextMenu = function(oMenu) {
		this.getParent().openContextMenu("Container", this, oMenu);
	};	

	Container.prototype.getDataElement = function() {
		var oElement = VoBase.prototype.getDataElement.apply(this, arguments);
		var oBindInfo = this.oParent.mBindInfo;

		// add the VO specific properties..................................//
		//oElement.IK = this.getId();
		oElement.IK = this.getUniqueId();
		if (oBindInfo.P) {
			oElement.P = this.getPosition();
		}
		if (oBindInfo.AL) {
			oElement.AL = this.getAlignment();
		}

		return oElement;
	};

	Container.prototype.handleChangedData = function(oElement) {
		if (oElement.P) {
			this.setPosition(oElement.P);
		}
	};

	return Container;

});
