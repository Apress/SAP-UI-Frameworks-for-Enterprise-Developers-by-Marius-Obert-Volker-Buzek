/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides control sap.ui.comp.navpopover.SmartLink.
sap.ui.define([
	'sap/ui/base/ManagedObject', 'sap/m/Link', './LinkData', 'sap/ui/core/Control', './SemanticObjectController',
	'./NavigationPopoverHandler', 'sap/ui/model/json/JSONModel', 'sap/ui/comp/personalization/Util',
	'./Util', 'sap/base/Log', './SmartLinkRenderer'
], function(ManagedObject, Link, LinkData, Control, SemanticObjectController, NavigationPopoverHandler, JSONModel, PersonalizationUtil, Util, Log, SmartLinkRenderer) {
	"use strict";

	/**
	 * @class
	 * The <code>SmartLink</code> control uses a semantic object to display {@link sap.ui.comp.navpopover.NavigationPopover NavigationPopover}
	 * for further navigation steps.<br>
	 * <b>Note:</b> Navigation targets are determined using {@link sap.ushell.services.CrossApplicationNavigation CrossApplicationNavigation} of the unified shell service.
	 *
	 * <b>Important:</b> Keep in mind that <code>SmartLink</code>, like all SAPUI5 smart controls, retrieves and analyzes
	 * the metadata and annotations of OData services. <b>The OData metadata is its primary API. These OData services
	 * are not part of the SAPUI5 framework and are usually maintained by the backend developers of your application.</b>
	 *
	 * With time, <code>SmartLink</code> can evolve and acquire new features. This means that its behavior or functionalities
	 * may change if the annotations that define this change are maintained in your backend metadata. To benefit from the new
	 * functionalities, your application should be able to adapt the backend metadata. <b>Therefore, we recommend
	 * using <code>SmartLink</code> only if you have control over the metadata of your application.</b>
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control

	 * @extends sap.m.Link
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.navpopover.SmartLink
	 * @see {@link topic:f638884d0d624ad8a243f4005f8e9972 Smart Link}
	 */
	var SmartLink = Link.extend("sap.ui.comp.navpopover.SmartLink", /** @lends sap.ui.comp.navpopover.SmartLink.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			designtime: "sap/ui/comp/designtime/navpopover/SmartLink.designtime",
			properties: {

				/**
				 * Name of semantic object which is used to fill the navigation popover. <b>Note</b>: Setting a value triggers an asynchronous
				 * determination, so the effect can be delayed.
				 *
				 * @since 1.28.0
				 */
				semanticObject: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Semantic object names which can be used additional to the default <code>semanticObject</code> property in order to get navigation
				 * targets links.
				 *
				 * @since 1.42.0
				 */
				additionalSemanticObjects: {
					type: "string[]",
					defaultValue: []
				},

				/**
				 * The semantic object controller controls events for several SmartLink controls. If the controller is not set manually, it tries to
				 * find a SemanticObjectController in its parent hierarchy.
				 *
				 * @since 1.28.0
				 */
				semanticObjectController: {
					type: "any",
					defaultValue: null
				},

				/**
				 * The metadata field name for this SmartLink control.
				 *
				 * @since 1.28.0
				 */
				fieldName: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Shown label of semantic object.
				 *
				 * @deprecated As of version 1.40.0 Title section with <code>semanticObjectLabel</code> has been removed due to new UI design
				 * @since 1.28.0
				 */
				semanticObjectLabel: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Function that enables the SmartLink control to create an alternative control, which is displayed if no navigation targets are
				 * available. The function has no parameters and has to return an instance of sap.ui.core.Control.
				 *
				 * @since 1.28.0
				 */
				createControlCallback: {
					type: "object",
					defaultValue: null
				},

				/**
				 * If set to <code>false</code>, the SmartLink control will not replace its field name with the according
				 * <code>semanticObject</code> property during the calculation of the semantic attributes. This enables the usage of several
				 * SmartLink controls on the same semantic object.
				 */
				mapFieldToSemanticObject: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Navigation property that points from the current to the related entity type where the com.sap.vocabularies.Communication.v1.Contact
				 * annotation is defined, for example, <code>'to_Supplier'</code>. An empty string means that the related entity type is the
				 * current one.
				 *
				 * @since 1.40.0
				 */
				contactAnnotationPath: {
					type: "string",
					defaultValue: undefined
				},

				/**
				 * If set to <code>true</code>, the SmartLink control will render the <code>innerControl</code> or the control provided by
				 * <code>createControlCallback</code> instead of the actual link. This is used for example by the SemanticObjectController if this
				 * SmartLink is listed in its <code>ignoredFields</code> or no navigation targets were found during prefetch.
				 *
				 * @since 1.28.0
				 */
				ignoreLinkRendering: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines whether the personalization link is shown inside the NavigationPopover control.
				 *
				 * @since 1.44.0
				 */
				enableAvailableActionsPersonalization: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * If set to true, the <code>SmartLink</code> control is rendered as a link even if <code>contactAnnotationPath</code> is not set  and navigation targets do not exist.
				 * Setting this property to <code>true</code> allows the application, for example, to modify the <code>SmartLink</code> control in the event handler, after the user
				 * has clicked on a link and the registered event handler has been called.
				 *
				 * <b>Note:</b> The <code>ignoreLinkRendering</code> property and the <code>ignoredFields</code> property of the associated <code>SemanticObjectController</code>
				 * take precedence over <code>forceLinkRendering</code>.
				 *
				 * @since 1.58.0
				 */
				forceLinkRendering: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Additionally to the <code>text</code> property the Unit of Measure can be displayed.
				 *
				 * @since 1.48.0
				 */
				uom: {
					type: "string",
					defaultValue: undefined
				},
				/**
				 * Function that is called before the actual navigation happens. This function has to return a promise resolving into a Boolean value for
				 *  which the navigation will wait. If the Boolean value is <code>true</code>, the navigation will be processed.
				 * The <code>beforeNavigationCallback(oNavigationInfo)</code> parameter contains the following data:
				 * <ul>
				 * 	<li>{String} text: Text of the navigation intent</li>
				 *	<li>{String} href: HREF of the navigation intent</li>
				 *	<li>{String} originalId: ID of the control that fires the navigation intent</li>
				 *	<li>{String} semanticObject: Name of the <code>SemanticObject</code> of the navigation intent</li>
				 *	<li>{Object} semanticAttributes: Object containing the <code>SemanticAttributes</code> of the navigation intent</li>
				 * </ul>
				 * @since 1.75.0
				 */
				beforeNavigationCallback: {
					type: "function"
				}
			},
			aggregations: {

				/**
				 * Control that is displayed instead of SmartLink control, if the SmartLink is disabled (for example, if no navigation targets are
				 * available). If <code>innerControl</code> is not provided, the SmartLink control tries to create one with property
				 * <code>createControlCallback</code>.
				 *
				 * @since 1.28.0
				 */
				innerControl: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {

				/**
				 * Event is fired before the navigation popover opens and before navigation target links are getting retrieved. Event can be used to
				 * change the parameters used to retrieve the navigation targets. In case of SmartLink control, the <code>beforePopoverOpens</code>
				 * is fired after the link has been clicked.
				 *
				 * @since 1.28.0
				 */
				beforePopoverOpens: {
					parameters: {
						/**
						 * The semantic object for which the navigation targets will be retrieved.
						 */
						semanticObject: {
							type: "string"
						},

						/**
						 * Map containing the semantic attributes calculated from the binding that will be used to retrieve the navigation targets.
						 *
						 * @deprecated Since 1.42.0. The parameter <code>semanticAttributes</code> is obsolete. Instead use the parameter
						 *             <code>semanticAttributesOfSemanticObjects</code>.
						 */
						semanticAttributes: {
							type: "object"
						},

						/**
						 * A map of semantic objects for which the navigation targets will be retrieved and it's semantic attributes calculated from
						 * the binding context. The semantic attributes will be used as parameters in order to retrieve the navigation targets.
						 *
						 * @since 1.42.0
						 */
						semanticAttributesOfSemanticObjects: {
							type: "object"
						},

						/**
						 * This callback function enables you to define a changed semantic attributes map. Signatures:
						 * <code>setSemanticAttributes(oSemanticAttributesMap)</code> Parameter:
						 * <ul>
						 * <li>{object} oSemanticAttributesMap New map containing the semantic attributes</li>
						 * <li>{string} sSemanticObject Semantic Object for which the oSemanticAttributesMap belongs</li>
						 * </ul>
						 */
						setSemanticAttributes: {
							type: "function"
						},

						/**
						 * This callback function sets an application state key that is used over the cross-application navigation. Signatures:
						 * <code>setAppStateKey(sAppStateKey)</code> Parameter:
						 * <ul>
						 * <li>{string} sAppStateKey</li>
						 * </ul>
						 */
						setAppStateKey: {
							type: "function"
						},

						/**
						 * The ID of the SmartLink control.
						 */
						originalId: {
							type: "string"
						},

						/**
						 * This callback function triggers the retrieval of navigation targets and leads to the opening of the navigation popover.
						 * Signatures: <code>open()</code> If the <code>beforePopoverOpens</code> has been registered, the <code>open</code>
						 * function has to be called manually in order to open the navigation popover.
						 */
						open: {
							type: "function"
						}
					}
				},

				/**
				 * After the navigation targets are retrieved, <code>navigationTargetsObtained</code> is fired and provides the possibility to
				 * change the targets.
				 *
				 * @since 1.28.0
				 */
				navigationTargetsObtained: {
					parameters: {
						/**
						 * The main navigation object.
						 */
						mainNavigation: {
							type: "sap.ui.comp.navpopover.LinkData"
						},

						/**
						 * Array of available navigation target objects.
						 */
						actions: {
							type: "sap.ui.comp.navpopover.LinkData[]"
						},

						/**
						 * The navigation object for the own application. This navigation option is by default not visible on the popover.
						 */
						ownNavigation: {
							type: "sap.ui.comp.navpopover.LinkData"
						},

						/**
						 * Array containing contact data.
						 */
						popoverForms: {
							type: "sap.ui.layout.form.SimpleForm[]"
						},

						/**
						 * The semantic object for which the navigation targets have been retrieved.
						 */
						semanticObject: {
							type: "string"
						},

						/**
						 * Map containing the semantic attributes.
						 */
						semanticAttributes: {
							type: "object"
						},

						/**
						 * The ID of the SmartLink control.
						 */
						originalId: {
							type: "string"
						},

						/**
						 * This callback function shows the actual navigation popover. If the <code>navigationTargetsObtained</code> has been
						 * registered, the <code>show</code> function has to be called manually in order to open the navigation popover. Signatures:
						 * <code>show()</code>
						 * <ul>
						 * <li><code>show(oMainNavigation, aAvailableActions, oAdditionalContent)</code> Parameters:
						 * <ul>
						 * <li>{sap.ui.comp.navpopover.LinkData | null | undefined} oMainNavigation The main navigation object. With
						 * <code>null</code> the main navigation object will be removed. With <code>undefined</code> the old object will remain.</li>
						 * <li>{sap.ui.comp.navpopover.LinkData[] | [] | undefined} aAvailableActions Array containing the cross application
						 * navigation links. With empty array all available links will be removed. With <code>undefined</code> the old links will
						 * remain.</li>
						 * <li>{sap.ui.core.Control | null | undefined} oAdditionalContent Control that will be displayed in extra content section on
						 * the popover. With <code>null</code> the main extra content object will be removed. With <code>undefined</code> the old
						 * object still remains.</li>
						 * </ul>
						 * </li>
						 * <li><code>show(sMainNavigationId, oMainNavigation, aAvailableActions, oAdditionalContent)</code> Parameters:
						 * <ul>
						 * <li>{string | undefined} sMainNavigationId The visible description for the main navigation link. With <code>''</code>,
						 * both the description and subtitle will be removed. With <code>undefined</code>, the description is calculated using the
						 * binding context of a given source object (for example <code>SmartLink</code> control).</li>
						 * <li>{sap.ui.comp.navpopover.LinkData | null | undefined} oMainNavigation The main navigation object. With
						 * <code>null</code> the main navigation object will be removed. With <code>undefined</code> the old object will remain.</li>
						 * <li>{sap.ui.comp.navpopover.LinkData[] | [] | undefined} aAvailableActions Array containing the cross application
						 * navigation links. With empty array all available links will be removed. With <code>undefined</code> the old links will
						 * remain.</li>
						 * <li>{sap.ui.core.Control | null | undefined} oAdditionalContent Control that will be displayed in extra content section on
						 * the popover. With <code>null</code> the main extra content object will be removed. With <code>undefined</code> the old
						 * object still remains.</li>
						 * </ul>
						 * </li>
						 * </ul>
						 */
						show: {
							type: "function"
						}
					}
				},

				/**
				 * This event is fired after a navigation link on the navigation popover has been clicked. This event is only fired, if the user
				 * left-clicks the link. Right-clicking the link and selecting 'Open in New Window' etc. in the context menu does not fire the event.
				 *
				 * @since 1.28.0
				 */
				innerNavigate: {
					parameters: {
						/**
						 * The UI text shown in the clicked link.
						 */
						text: {
							type: "string"
						},

						/**
						 * The navigation target of the clicked link.
						 */
						href: {
							type: "string"
						},

						/**
						 * The semantic object used to retrieve this target.
						 */
						semanticObject: {
							type: "string"
						},

						/**
						 * Map containing the semantic attributes used to retrieve this target.
						 */
						semanticAttributes: {
							type: "object"
						},

						/**
						 * The ID of the SmartLink control.
						 */
						originalId: {
							type: "string"
						}
					}
				}
			}
		}
	});

	// ----------------------- Public Methods --------------------------

	/**
	 * Gets the inner control's value, if no inner control is available, the text of SmartLink control will be returned.
	 *
	 * @returns {object} the value
	 * @public
	 */
	SmartLink.prototype.getInnerControlValue = function() {
		if (this._isRenderingInnerControl()) {
			var oInnerControl = this._getInnerControl();

			if (oInnerControl) {
				if (oInnerControl.getText) {
					return oInnerControl.getText();
				}

				if (oInnerControl.getValue) {
					return oInnerControl.getValue();
				}
			}
		}

		return this.getText();
	};

	/**
	 * Gets the composition NavigationPopoverHandler
	 *
	 * @returns {sap.ui.comp.navpopover.NavigationPopoverHandler}
	 * @private
	 */
	SmartLink.prototype.getNavigationPopoverHandler = function() {
		return this._createNavigationPopoverHandler();
	};

	// ----------------------- Overwrite Methods --------------------------

	SmartLink.prototype.init = function() {
		// In order to consume available semanticObjects from FLP we have to instantiate SemanticObjectController object
		SemanticObjectController.prefetchDistinctSemanticObjects();

		this._oNavigationPopoverHandler = null;

		this.attachPress(this._onLinkPressed);
		this.addStyleClass("sapUiCompSmartLink");
		// call setter for text to determine if link is visible or not
		this.setText(this.getText());
	};

	SmartLink.prototype.applySettings = function(mSettings) {
		ManagedObject.prototype.applySettings.apply(this, arguments);
		this._updateEnabled();
	};

	SmartLink.prototype.onAfterRendering = function() {
		Link.prototype.onAfterRendering.apply(this, arguments);
		this.getDomRef().setAttribute("aria-hidden", !this.getText());
	};

	SmartLink.prototype.updateBindingContext = function() {
		Control.prototype.updateBindingContext.apply(this, arguments);
		this.setHref(null);
		this.setTarget(null);
		if (this._oNavigationPopoverHandler) {
			this._oNavigationPopoverHandler.setBindingContext(this.getBindingContext());
		}
	};

	SmartLink.prototype._getTextOfDom = function() {
		if (!this.getDomRef()) {
			return "";
		}
		if (this.$().find("span").length === 2) {
			return this.$().find("span")[0].textContent + this.$().find("span")[1].textContent;
		} else {
			return this.$()[0].textContent;
		}
	};

	SmartLink.prototype.setText = function(sText) {
		if (this._isRenderingInnerControl()) {
			// SmartLink renders inner control => overwrite base setText as it changes the DOM directly
			this.setProperty("text", sText, true);
		} else {
			Link.prototype.setText.call(this, sText);
		}
		return this;
	};

	SmartLink.prototype.setMapFieldToSemanticObject = function(bMapFieldToSemanticObject) {
		this.setProperty("mapFieldToSemanticObject", bMapFieldToSemanticObject);

		if (this._oNavigationPopoverHandler) {
			this._oNavigationPopoverHandler.setMapFieldToSemanticObject(bMapFieldToSemanticObject);
		}
		return this;
	};

	// BCP 1670108744: when semanticObjectController is set first then semanticObject is still not known in the step where ignoredState is
	// determined
	SmartLink.prototype.setSemanticObject = function(sSemanticObject) {
		this.setProperty("semanticObject", sSemanticObject);

		if (this._oNavigationPopoverHandler) {
			this._oNavigationPopoverHandler.setSemanticObject(sSemanticObject);
		}

		this._updateEnabled();
		return this;
	};

	SmartLink.prototype.setAdditionalSemanticObjects = function(aSemanticObjects) {
		this.setProperty("additionalSemanticObjects", aSemanticObjects);

		if (this._oNavigationPopoverHandler) {
			this._oNavigationPopoverHandler.setAdditionalSemanticObjects(aSemanticObjects);
		}

		this._updateEnabled();
		return this;
	};

	/**
	 * @param {Function} fnBeforeNavigationCallback the function that should be called before the navigation is triggered. This has to return a promise which the navigation will wait for.
	 * @returns {this} this
	 */
	SmartLink.prototype.setBeforeNavigationCallback = function(fnBeforeNavigationCallback) {
		this.setProperty("beforeNavigationCallback", fnBeforeNavigationCallback);

		if (this._oNavigationPopoverHandler) {
			this._oNavigationPopoverHandler.setBeforeNavigationCallback(fnBeforeNavigationCallback);
		}

		return this;
	};

	SmartLink.prototype.setContactAnnotationPath = function(sContactAnnotationPath) {
		this.setProperty("contactAnnotationPath", sContactAnnotationPath);

		if (this._oNavigationPopoverHandler) {
			this._oNavigationPopoverHandler.setContactAnnotationPath(sContactAnnotationPath);
		}

		this._updateEnabled();
		return this;
	};

	SmartLink.prototype.setEnableAvailableActionsPersonalization = function(bEnableAvailableActionsPersonalization) {
		this.setProperty("enableAvailableActionsPersonalization", bEnableAvailableActionsPersonalization);

		if (this._oNavigationPopoverHandler) {
			this._oNavigationPopoverHandler.setEnableAvailableActionsPersonalization(bEnableAvailableActionsPersonalization);
		}

		return this;
	};

	SmartLink.prototype.setIgnoreLinkRendering = function(bIgnoreLinkRendering) {
		this.setProperty("ignoreLinkRendering", bIgnoreLinkRendering);

		// If link should not be rendered, but no inner control is available, deactivate SmartLink
		// ER: also if the inner control is available e.g. sap.m.Text, we have to deactivate SmartLink. Otherwise the sap.m.Text becomes capability to
		// be clicked.
		this._updateEnabled();
		return this;
	};

	SmartLink.prototype.setFieldName = function(sFieldName) {
		this.setProperty("fieldName", sFieldName);

		if (this._oNavigationPopoverHandler) {
			this._oNavigationPopoverHandler.setFieldName(sFieldName);
		}

		this._updateEnabled();
		return this;
	};

	SmartLink.prototype.setSemanticObjectController = function(oControllerNew) {
		if (oControllerNew && !(oControllerNew.isA("sap.ui.comp.navpopover.SemanticObjectController"))) {
			Log.warning("Warning: setSemanticObjectController() has to be an object of sap.ui.comp.navpopover.SemanticObjectController instances", this);
			return this;
		}
		var oControllerOld = this.getProperty("semanticObjectController");

		if (oControllerOld === oControllerNew) {
			return this;
		}
		if (oControllerOld) {
			oControllerOld.unregisterControl(this);
		}
		this.setProperty("semanticObjectController", oControllerNew, true);
		if (oControllerNew) {
			if (this.hasListeners("navigationTargetsObtained") && oControllerNew.getReplaceSmartLinkNavigationTargetsObtained() && oControllerNew.hasListeners("navigationTargetsObtained")) {
				this.mEventRegistry.navigationTargetsObtained.forEach(function(oNavigationTargetsObtainedListener) {
					this.detachNavigationTargetsObtained(oNavigationTargetsObtainedListener.fFunction);
				}.bind(this));
			}
			oControllerNew.registerControl(this);
			if (!this.getBeforeNavigationCallback()) {
				this.setBeforeNavigationCallback(oControllerNew.getBeforeNavigationCallback());
			}
		}

		if (this._oNavigationPopoverHandler) {
			this._oNavigationPopoverHandler.setSemanticObjectController(oControllerNew);
		}

		this._updateEnabled();
		return this;
	};

	SmartLink.prototype.onBeforeRendering = function() {
		Link.prototype.onBeforeRendering.apply(this, arguments);

		// In case that 'semantiObjectController' has not been set, check if parent has a SemanticObjectController and take it as
		// 'semanticObjectController' property. This is especially needed when SmartLink is manually defined as column in view.xml and
		// SemanticObjectController is defined at the SmartTable. It is also needed in case of SmartField embedded into SmartForm which provides
		// 'semanticObjectController' aggregation.
		if (!this.getSemanticObjectController()) {
			var oSOC = this._getSemanticObjectControllerOfParent();
			if (oSOC) {
				this.setSemanticObjectController(oSOC);
			}
		}
	};

	SmartLink.prototype.exit = function() {
		// Disconnect from SemanticObjectController
		if (this.getSemanticObjectController()) {
			this.getSemanticObjectController().unregisterControl(this);
		}
		if (this._oNavigationPopoverHandler) {
			this._oNavigationPopoverHandler.destroy();
			this._oNavigationPopoverHandler = null;
		}
	};

	// -------------------------- Private Methods ------------------------------------

	/**
	 * @private
	 */
	SmartLink.prototype._onLinkPressed = function(oEvent) {
		this._createNavigationPopoverHandler().openPopover();
	};

	/**
	 * @private
	 */
	SmartLink.prototype._createNavigationPopoverHandler = function() {
		if (!this._oNavigationPopoverHandler) {
			if (!this.getFieldName()) {
				var oBinding = this.getBinding("text");
				var sFieldName;
				if (oBinding) {
					// BCP: 1980245820
					// check first for composite Binding because of assertion in
					// Change-Id: Ifbe8750e83b1027085a6f1b4f41e7ee2cb9b343b
					if (oBinding.getBindings) {
						// The first binding part is about field name, the second binding path is about description (see
						// ControlProvider._createSmartLinkFieldTemplate())
						sFieldName = oBinding.getBindings()[0].getPath();
					} else {
						sFieldName = oBinding.getPath();
					}
				}
				this.setFieldName(sFieldName);
			}
			this._oNavigationPopoverHandler = new NavigationPopoverHandler({
				semanticObject: this.getSemanticObject(),
				semanticObjectLabel: this.getSemanticObjectLabel(),
				additionalSemanticObjects: this.getAdditionalSemanticObjects(),
				semanticObjectController: this.getSemanticObjectController(),
				fieldName: this.getFieldName(),
				mapFieldToSemanticObject: this.getMapFieldToSemanticObject(),
				contactAnnotationPath: this.getContactAnnotationPath(),
				enableAvailableActionsPersonalization: this.getEnableAvailableActionsPersonalization(),
				control: this,
				beforePopoverOpens: this._onBeforePopoverOpens.bind(this),
				navigationTargetsObtained: this._onNavigationTargetsObtained.bind(this),
				innerNavigate: this._onInnerNavigate.bind(this),
				beforeNavigationCallback: this.getBeforeNavigationCallback()
			});
			this._oNavigationPopoverHandler.setModel(this.getModel());
			// Disable popover adaptation
			this._oNavigationPopoverHandler.isPopupAdaptationAllowed = function() {
				return false;
			};
		}
		return this._oNavigationPopoverHandler;
	};

	/**
	 * @private
	 */
	SmartLink.prototype._onNavigationTargetsObtained = function(oEvent) {
		var oParameters = oEvent.getParameters();
		if (!this.hasListeners("navigationTargetsObtained")) {
			oParameters.show();
			return;
		}
		this.fireNavigationTargetsObtained({
			mainNavigation: oParameters.mainNavigation,
			actions: oParameters.actions,
			ownNavigation: oParameters.ownNavigation,
			popoverForms: oParameters.popoverForms,
			semanticObject: oParameters.semanticObject,
			semanticAttributes: oParameters.semanticAttributes,
			originalId: oParameters.originalId,
			show: oParameters.show
		});
	};

	/**
	 * @private
	 */
	SmartLink.prototype._onBeforePopoverOpens = function(oEvent) {
		var oParameters = oEvent.getParameters();
		if (!this.hasListeners("beforePopoverOpens")) {
			oParameters.open();
			return;
		}
		this.fireBeforePopoverOpens({
			originalId: oParameters.originalId,
			semanticObject: oParameters.semanticObject,
			semanticAttributes: oParameters.semanticAttributes,
			semanticAttributesOfSemanticObjects: oParameters.semanticAttributesOfSemanticObjects,
			setSemanticAttributes: oParameters.setSemanticAttributes,
			setAppStateKey: oParameters.setAppStateKey,
			open: oParameters.open
		});
	};

	/**
	 * @private
	 */
	SmartLink.prototype._onInnerNavigate = function(oEvent) {
		var oParameters = oEvent.getParameters();
		if (!this.hasListeners("innerNavigate")) {
			return;
		}
		this.fireInnerNavigate({
			text: oParameters.text,
			href: oParameters.href,
			internalHref: oParameters.internalHref,
			originalId: oParameters.originalId,
			semanticObject: oParameters.semanticObject,
			semanticAttributes: oParameters.semanticAttributes
		});
	};

	SmartLink.prototype._isRenderingInnerControl = function() {
		return this.getIgnoreLinkRendering() && this._getInnerControl() !== null;
	};

	/**
	 * Gets the inner control which is provided by the CreateControlCallback
	 *
	 * @returns {sap.ui.core.Control} The control.
	 * @private
	 */
	SmartLink.prototype._getInnerControl = function() {
		var oInnerControl = this.getAggregation("innerControl");
		if (oInnerControl) {
			return oInnerControl;
		}

		var fCreate = this.getCreateControlCallback();
		if (fCreate) {
			oInnerControl = fCreate();
			this.setAggregation("innerControl", oInnerControl, true);
			return oInnerControl;
		}

		return null;
	};

	/**
	 * @private
	 */
	SmartLink.prototype._getSemanticObjectControllerOfParent = function() {
		var oSemanticObjectController;
		var oParent = this.getParent();
		while (oParent) {
			if (oParent.getSemanticObjectController) {
				oSemanticObjectController = oParent.getSemanticObjectController();
				if (oSemanticObjectController) {
					this.setSemanticObjectController(oSemanticObjectController);
					break;
				}
			}
			oParent = oParent.getParent();
		}
		return oSemanticObjectController;
	};

	/**
	 * @private
	 */
	SmartLink.prototype._updateEnabled = function() {
		var that = this;
		return SemanticObjectController.getDistinctSemanticObjects().then(function(oSemanticObjects) {
			// Take the newest property values as in the meantime they could be changed

			if (that.getSemanticObjectController() && PersonalizationUtil.createArrayFromString(that.getSemanticObjectController().getIgnoredFields()).indexOf(that.getFieldName()) > -1) {
				that.setEnabled(false);
				return;
			}
			if (that.getIgnoreLinkRendering() === true) {
				that.setEnabled(false);
				return;
			}
			if (Util.getForceLinkRendering(that, that.getSemanticObjectController())) {
				that.setEnabled(true);
				return;
			}
			if (!SemanticObjectController.hasDistinctSemanticObject(that.getAdditionalSemanticObjects().concat(that.getSemanticObject()), oSemanticObjects) && Util.getContactAnnotationPath(that, that.getSemanticObjectController()) === undefined) {
				that.setEnabled(false);
				return;
			}

			// ... otherwise we set the SmartLink as enabled. The user of SmartLink can set actions or content in the event handler of event 'navigationTargetsObtained'
			that.setEnabled(true);
		});
	};

	SmartLink.prototype.getAccessibilityInfo = function() {
		// BCP 1880542324
		var oAccessibilityInfo = this.getEnabled() ? Link.prototype.getAccessibilityInfo.apply(this, arguments) : {
			description: this.getText() || this.getHref() || ""
		};

		if (this.getUom() && oAccessibilityInfo.description && oAccessibilityInfo.description !== "" && !oAccessibilityInfo.description.includes(this.getUom())) {
			oAccessibilityInfo.description += this.getUom();
		}

		return oAccessibilityInfo;
	};

	return SmartLink;

});
