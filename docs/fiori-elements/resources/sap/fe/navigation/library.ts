import Core from "sap/ui/core/Core";
import "sap/ui/core/library";

const ParamHandlingMode = {
	/**
	 * The conflict resolution favors the SelectionVariant over URL parameters
	 *
	 * @public
	 */
	SelVarWins: "SelVarWins",

	/**
	 * The conflict resolution favors the URL parameters over the SelectionVariant. Caution: In case of cross-app navigation
	 * a navigation parameter value from the source app is overwritten by a default, if a default is maintained in the launchpad
	 * designer for this parameter in the target app!
	 *
	 * @public
	 */
	URLParamWins: "URLParamWins",

	/**
	 * The conflict resolution adds URL parameters to the SelectionVariant
	 *
	 * @public
	 */
	InsertInSelOpt: "InsertInSelOpt"
} as const;

const NavType = {
	/**
	 * Initial startup without any navigation or default parameters
	 *
	 * @public
	 */
	initial: "initial",

	/**
	 * Basic cross-app navigation with URL parameters only (without sap-xapp-state) or initial start with default parameters
	 *
	 * @public
	 */
	URLParams: "URLParams",

	/**
	 * Cross-app navigation with sap-xapp-state parameter (and URL parameters), defaulted parameters may be added
	 *
	 * @public
	 */
	xAppState: "xAppState",

	/**
	 * Back navigation with sap-iapp-state parameter
	 *
	 * @public
	 */
	iAppState: "iAppState"
} as const;

const SuppressionBehavior = {
	/**
	 * Standard suppression behavior: semantic attributes with a <code>null</code> or an <code>undefined</code> value are ignored,
	 * the remaining attributes are mixed in to the selection variant
	 *
	 * @public
	 */
	standard: 0,

	/**
	 * Semantic attributes with an empty string are ignored, the remaining attributes are mixed in to the selection variant.
	 * Warning! Consider the impact on Boolean variable values!
	 *
	 * @public
	 */
	ignoreEmptyString: 1,

	/**
	 * Semantic attributes with a <code>null</code> value lead to an {@link sap.fin.central.lib.error.Error error} of type NavigationHandler.INVALID_INPUT
	 *
	 * @public
	 */
	raiseErrorOnNull: 2,

	/**
	 * Semantic attributes with an <code>undefined</code> value lead to an {@link sap.fin.central.lib.error.Error error} of type NavigationHandler.INVALID_INPUT
	 *
	 * @public
	 */
	raiseErrorOnUndefined: 4
} as const;

const Mode = {
	/**
	 * This is used for ODataV2 services to do some internal tasks like creation of appstate, removal of sensitive data etc.,
	 *
	 * @public
	 */
	ODataV2: "ODataV2",

	/**
	 * This is used for ODataV4 services to do some internal tasks like creation of appstate, removal of sensitive data etc.,
	 *
	 * @public
	 */
	ODataV4: "ODataV4"
} as const;

/**
 * Common library for all cross-application navigation functions.
 *
 * @public
 * @name sap.fe.navigation
 * @namespace
 * @since 1.83.0
 */
const thisLib = Core.initLibrary({
	name: "sap.fe.navigation",
	// eslint-disable-next-line no-template-curly-in-string
	version: "${version}",
	dependencies: ["sap.ui.core"],
	types: ["sap.fe.navigation.NavType", "sap.fe.navigation.ParamHandlingMode", "sap.fe.navigation.SuppressionBehavior"],
	interfaces: [],
	controls: [],
	elements: [],
	noLibraryCSS: true
}) as {
	[key: string]: unknown;
	ParamHandlingMode: typeof ParamHandlingMode;
	NavType: typeof NavType;
	SuppressionBehavior: typeof SuppressionBehavior;
	Mode: typeof Mode;
};

/**
 * This is the successor of {@link sap.ui.generic.app.navigation.service.ParamHandlingMode}.<br>
 * A static enumeration type which indicates the conflict resolution method when merging URL parameters into select options.
 *
 * @public
 * @name sap.fe.navigation.ParamHandlingMode
 * @enum {string}
 * @readonly
 * @since 1.83.0
 */
thisLib.ParamHandlingMode = ParamHandlingMode;

/**
 * This is the successor of {@link sap.ui.generic.app.navigation.service.NavType}.<br>
 * A static enumeration type which indicates the type of inbound navigation.
 *
 * @public
 * @name sap.fe.navigation.NavType
 * @enum {string}
 * @readonly
 * @since 1.83.0
 */
thisLib.NavType = NavType;

/**
 * This is the successor of {@link sap.ui.generic.app.navigation.service.SuppressionBehavior}.<br>
 * A static enumeration type which indicates whether semantic attributes with values <code>null</code>,
 * <code>undefined</code> or <code>""</code> (empty string) shall be suppressed, before they are mixed in to the selection variant in the
 * method {@link sap.fe.navigation.NavigationHandler.mixAttributesAndSelectionVariant mixAttributesAndSelectionVariant}
 * of the {@link sap.fe.navigation.NavigationHandler NavigationHandler}.
 *
 * @public
 * @name sap.fe.navigation.SuppressionBehavior
 * @enum {string}
 * @readonly
 * @since 1.83.0
 */
thisLib.SuppressionBehavior = SuppressionBehavior;

/**
 * A static enumeration type which indicates the Odata version used for runnning the Navigation Handler.
 *
 * @public
 * @name sap.fe.navigation.Mode
 * @enum {string}
 * @readonly
 * @since 1.83.0
 */
thisLib.Mode = Mode;

export default thisLib;
