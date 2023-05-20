/*!
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

/**
 * Initialization Code and shared classes of library sap.ui.generic.app.
 */
sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library', 'sap/m/library', 'sap/fe/navigation/library'],
	function(Core) {
	"use strict";


	/**
	 * SAPUI5 library that provides generic reuse functionality which can be used by Applications.
	 *
	 * @namespace
	 * @alias sap.ui.generic.app
	 * @author SAP SE
	 * @version 1.113.0
	 * @public
	 */
	var thisLib = Core.initLibrary({
		name : "sap.ui.generic.app",
		version: "1.113.0",
		dependencies : ["sap.ui.core", "sap.m", "sap.fe.navigation"],
		types: 	[
				"sap.ui.generic.app.navigation.service.NavType",
				"sap.ui.generic.app.navigation.service.ParamHandlingMode",
				"sap.ui.generic.app.navigation.service.SuppressionBehavior"
				],
		interfaces: [],
		controls: [],
		elements: [],
		noLibraryCSS: true
	});

	/**
	 * @namespace
	 * @name sap.ui.generic.app.navigation
	 * @public
	 * @deprecated Since version 1.83.0
	 */
	thisLib.navigation = thisLib.navigation || {};

	/**
	 * @namespace
	 * @name sap.ui.generic.app.navigation.service
	 * @public
	 * @deprecated Since version 1.83.0
	 */
	thisLib.navigation.service = thisLib.navigation.service || {};

	/**
	 * A static enumeration type which indicates the conflict resolution method when merging URL parameters into select options
	 * @enum {string}
	 * @name sap.ui.generic.app.navigation.service.ParamHandlingMode
	 * @readonly
	 * @public
	 * @deprecated Since version 1.83.0. Please use {@link sap.fe.navigation.ParamHandlingMode} instead.
	 */
	thisLib.navigation.service.ParamHandlingMode = {

		/**
		 * The conflict resolution favors the SelectionVariant over URL parameters
		 * @public
		 */
		SelVarWins : "SelVarWins",

		/**
		 * The conflict resolution favors the URL parameters over the SelectionVariant. Caution: In case of cross-app navigation
		 * a navigation parameter value from the source app is overwritten by a default, if a default is maintained in the launchpad
		 * designer for this parameter in the target app!
		 * @public
		 */
		URLParamWins : "URLParamWins",

		/**
		 * The conflict resolution adds URL parameters to the SelectionVariant
		 * @public
		 */
		InsertInSelOpt : "InsertInSelOpt"
	};

	/**
	 * A static enumeration type which indicates the type of inbound navigation
	 * @enum {string}
	 * @readonly
	 * @public
	 * @name sap.ui.generic.app.navigation.service.NavType
	 * @deprecated Since version 1.83.0. Please use {@link sap.fe.navigation.NavType} instead.
	 */
	thisLib.navigation.service.NavType = {
		/**
		 * Initial startup without any navigation or default parameters
		 * @public
		 */
		initial : "initial",

		/**
		 * Basic cross-app navigation with URL parameters only (without sap-xapp-state) or initial start with default parameters
		 * @public
		 */
		URLParams : "URLParams",

		/**
		 * Cross-app navigation with sap-xapp-state parameter (and URL parameters), defaulted parameters may be added
		 * @public
		 */
		xAppState : "xAppState",

		/**
		 * Back navigation with sap-iapp-state parameter
		 * @public
		 */
		iAppState : "iAppState"
	};

	/**
	 * A static enumeration type which indicates whether semantic attributes with values <code>null</code>,
	 * <code>undefined</code> or <code>""</code> (empty string) shall be suppressed, before they are mixed in to the selection variant in the
	 * method {@link sap.ui.generic.app.navigation.service.NavigationHandler.mixAttributesAndSelectionVariant mixAttributesAndSelectionVariant}
	 * of the {@link sap.ui.generic.app.navigation.service.NavigationHandler NavigationHandler}
	 * @enum {int}
	 * @name sap.ui.generic.app.navigation.service.SuppressionBehavior
	 * @readonly
	 * @public
	 * @deprecated Since version 1.83.0. Please use {@link sap.fe.navigation.SuppressionBehavior} instead.
	 */
	thisLib.navigation.service.SuppressionBehavior = {

		/**
		 * Standard suppression behavior: semantic attributes with a <code>null</code> or an <code>undefined</code> value are ignored,
		 * the remaining attributes are mixed in to the selection variant
		 * @public
		 */
		standard : 0,

		/**
		 * Semantic attributes with an empty string are ignored, the remaining attributes are mixed in to the selection variant.
		 * Warning! Consider the impact on Boolean variable values!
		 * @public
		 */
		ignoreEmptyString : 1,

		/**
		 * Semantic attributes with a <code>null</code> value lead to an {@link sap.fin.central.lib.error.Error error} of type NavigationHandler.INVALID_INPUT
		 * @public
		 */
		raiseErrorOnNull : 2,

		/**
		 * Semantic attributes with an <code>undefined</code> value lead to an {@link sap.fin.central.lib.error.Error error} of type NavigationHandler.INVALID_INPUT
		 * @public
		 */
		raiseErrorOnUndefined : 4

	};

	sap.ui.require("sap.ui.generic.app.AppComponent");

	return thisLib;

});