/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core", "sap/ui/core/library"], function (Core, _library) {
  "use strict";

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
  };
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
  };
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
  };
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
  };

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
    version: "1.113.0",
    dependencies: ["sap.ui.core"],
    types: ["sap.fe.navigation.NavType", "sap.fe.navigation.ParamHandlingMode", "sap.fe.navigation.SuppressionBehavior"],
    interfaces: [],
    controls: [],
    elements: [],
    noLibraryCSS: true
  });

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
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXJhbUhhbmRsaW5nTW9kZSIsIlNlbFZhcldpbnMiLCJVUkxQYXJhbVdpbnMiLCJJbnNlcnRJblNlbE9wdCIsIk5hdlR5cGUiLCJpbml0aWFsIiwiVVJMUGFyYW1zIiwieEFwcFN0YXRlIiwiaUFwcFN0YXRlIiwiU3VwcHJlc3Npb25CZWhhdmlvciIsInN0YW5kYXJkIiwiaWdub3JlRW1wdHlTdHJpbmciLCJyYWlzZUVycm9yT25OdWxsIiwicmFpc2VFcnJvck9uVW5kZWZpbmVkIiwiTW9kZSIsIk9EYXRhVjIiLCJPRGF0YVY0IiwidGhpc0xpYiIsIkNvcmUiLCJpbml0TGlicmFyeSIsIm5hbWUiLCJ2ZXJzaW9uIiwiZGVwZW5kZW5jaWVzIiwidHlwZXMiLCJpbnRlcmZhY2VzIiwiY29udHJvbHMiLCJlbGVtZW50cyIsIm5vTGlicmFyeUNTUyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsibGlicmFyeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuXG5jb25zdCBQYXJhbUhhbmRsaW5nTW9kZSA9IHtcblx0LyoqXG5cdCAqIFRoZSBjb25mbGljdCByZXNvbHV0aW9uIGZhdm9ycyB0aGUgU2VsZWN0aW9uVmFyaWFudCBvdmVyIFVSTCBwYXJhbWV0ZXJzXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdFNlbFZhcldpbnM6IFwiU2VsVmFyV2luc1wiLFxuXG5cdC8qKlxuXHQgKiBUaGUgY29uZmxpY3QgcmVzb2x1dGlvbiBmYXZvcnMgdGhlIFVSTCBwYXJhbWV0ZXJzIG92ZXIgdGhlIFNlbGVjdGlvblZhcmlhbnQuIENhdXRpb246IEluIGNhc2Ugb2YgY3Jvc3MtYXBwIG5hdmlnYXRpb25cblx0ICogYSBuYXZpZ2F0aW9uIHBhcmFtZXRlciB2YWx1ZSBmcm9tIHRoZSBzb3VyY2UgYXBwIGlzIG92ZXJ3cml0dGVuIGJ5IGEgZGVmYXVsdCwgaWYgYSBkZWZhdWx0IGlzIG1haW50YWluZWQgaW4gdGhlIGxhdW5jaHBhZFxuXHQgKiBkZXNpZ25lciBmb3IgdGhpcyBwYXJhbWV0ZXIgaW4gdGhlIHRhcmdldCBhcHAhXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdFVSTFBhcmFtV2luczogXCJVUkxQYXJhbVdpbnNcIixcblxuXHQvKipcblx0ICogVGhlIGNvbmZsaWN0IHJlc29sdXRpb24gYWRkcyBVUkwgcGFyYW1ldGVycyB0byB0aGUgU2VsZWN0aW9uVmFyaWFudFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRJbnNlcnRJblNlbE9wdDogXCJJbnNlcnRJblNlbE9wdFwiXG59IGFzIGNvbnN0O1xuXG5jb25zdCBOYXZUeXBlID0ge1xuXHQvKipcblx0ICogSW5pdGlhbCBzdGFydHVwIHdpdGhvdXQgYW55IG5hdmlnYXRpb24gb3IgZGVmYXVsdCBwYXJhbWV0ZXJzXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGluaXRpYWw6IFwiaW5pdGlhbFwiLFxuXG5cdC8qKlxuXHQgKiBCYXNpYyBjcm9zcy1hcHAgbmF2aWdhdGlvbiB3aXRoIFVSTCBwYXJhbWV0ZXJzIG9ubHkgKHdpdGhvdXQgc2FwLXhhcHAtc3RhdGUpIG9yIGluaXRpYWwgc3RhcnQgd2l0aCBkZWZhdWx0IHBhcmFtZXRlcnNcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0VVJMUGFyYW1zOiBcIlVSTFBhcmFtc1wiLFxuXG5cdC8qKlxuXHQgKiBDcm9zcy1hcHAgbmF2aWdhdGlvbiB3aXRoIHNhcC14YXBwLXN0YXRlIHBhcmFtZXRlciAoYW5kIFVSTCBwYXJhbWV0ZXJzKSwgZGVmYXVsdGVkIHBhcmFtZXRlcnMgbWF5IGJlIGFkZGVkXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHhBcHBTdGF0ZTogXCJ4QXBwU3RhdGVcIixcblxuXHQvKipcblx0ICogQmFjayBuYXZpZ2F0aW9uIHdpdGggc2FwLWlhcHAtc3RhdGUgcGFyYW1ldGVyXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGlBcHBTdGF0ZTogXCJpQXBwU3RhdGVcIlxufSBhcyBjb25zdDtcblxuY29uc3QgU3VwcHJlc3Npb25CZWhhdmlvciA9IHtcblx0LyoqXG5cdCAqIFN0YW5kYXJkIHN1cHByZXNzaW9uIGJlaGF2aW9yOiBzZW1hbnRpYyBhdHRyaWJ1dGVzIHdpdGggYSA8Y29kZT5udWxsPC9jb2RlPiBvciBhbiA8Y29kZT51bmRlZmluZWQ8L2NvZGU+IHZhbHVlIGFyZSBpZ25vcmVkLFxuXHQgKiB0aGUgcmVtYWluaW5nIGF0dHJpYnV0ZXMgYXJlIG1peGVkIGluIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzdGFuZGFyZDogMCxcblxuXHQvKipcblx0ICogU2VtYW50aWMgYXR0cmlidXRlcyB3aXRoIGFuIGVtcHR5IHN0cmluZyBhcmUgaWdub3JlZCwgdGhlIHJlbWFpbmluZyBhdHRyaWJ1dGVzIGFyZSBtaXhlZCBpbiB0byB0aGUgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdCAqIFdhcm5pbmchIENvbnNpZGVyIHRoZSBpbXBhY3Qgb24gQm9vbGVhbiB2YXJpYWJsZSB2YWx1ZXMhXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGlnbm9yZUVtcHR5U3RyaW5nOiAxLFxuXG5cdC8qKlxuXHQgKiBTZW1hbnRpYyBhdHRyaWJ1dGVzIHdpdGggYSA8Y29kZT5udWxsPC9jb2RlPiB2YWx1ZSBsZWFkIHRvIGFuIHtAbGluayBzYXAuZmluLmNlbnRyYWwubGliLmVycm9yLkVycm9yIGVycm9yfSBvZiB0eXBlIE5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cmFpc2VFcnJvck9uTnVsbDogMixcblxuXHQvKipcblx0ICogU2VtYW50aWMgYXR0cmlidXRlcyB3aXRoIGFuIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gdmFsdWUgbGVhZCB0byBhbiB7QGxpbmsgc2FwLmZpbi5jZW50cmFsLmxpYi5lcnJvci5FcnJvciBlcnJvcn0gb2YgdHlwZSBOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJhaXNlRXJyb3JPblVuZGVmaW5lZDogNFxufSBhcyBjb25zdDtcblxuY29uc3QgTW9kZSA9IHtcblx0LyoqXG5cdCAqIFRoaXMgaXMgdXNlZCBmb3IgT0RhdGFWMiBzZXJ2aWNlcyB0byBkbyBzb21lIGludGVybmFsIHRhc2tzIGxpa2UgY3JlYXRpb24gb2YgYXBwc3RhdGUsIHJlbW92YWwgb2Ygc2Vuc2l0aXZlIGRhdGEgZXRjLixcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0T0RhdGFWMjogXCJPRGF0YVYyXCIsXG5cblx0LyoqXG5cdCAqIFRoaXMgaXMgdXNlZCBmb3IgT0RhdGFWNCBzZXJ2aWNlcyB0byBkbyBzb21lIGludGVybmFsIHRhc2tzIGxpa2UgY3JlYXRpb24gb2YgYXBwc3RhdGUsIHJlbW92YWwgb2Ygc2Vuc2l0aXZlIGRhdGEgZXRjLixcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0T0RhdGFWNDogXCJPRGF0YVY0XCJcbn0gYXMgY29uc3Q7XG5cbi8qKlxuICogQ29tbW9uIGxpYnJhcnkgZm9yIGFsbCBjcm9zcy1hcHBsaWNhdGlvbiBuYXZpZ2F0aW9uIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcHVibGljXG4gKiBAbmFtZSBzYXAuZmUubmF2aWdhdGlvblxuICogQG5hbWVzcGFjZVxuICogQHNpbmNlIDEuODMuMFxuICovXG5jb25zdCB0aGlzTGliID0gQ29yZS5pbml0TGlicmFyeSh7XG5cdG5hbWU6IFwic2FwLmZlLm5hdmlnYXRpb25cIixcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXRlbXBsYXRlLWN1cmx5LWluLXN0cmluZ1xuXHR2ZXJzaW9uOiBcIiR7dmVyc2lvbn1cIixcblx0ZGVwZW5kZW5jaWVzOiBbXCJzYXAudWkuY29yZVwiXSxcblx0dHlwZXM6IFtcInNhcC5mZS5uYXZpZ2F0aW9uLk5hdlR5cGVcIiwgXCJzYXAuZmUubmF2aWdhdGlvbi5QYXJhbUhhbmRsaW5nTW9kZVwiLCBcInNhcC5mZS5uYXZpZ2F0aW9uLlN1cHByZXNzaW9uQmVoYXZpb3JcIl0sXG5cdGludGVyZmFjZXM6IFtdLFxuXHRjb250cm9sczogW10sXG5cdGVsZW1lbnRzOiBbXSxcblx0bm9MaWJyYXJ5Q1NTOiB0cnVlXG59KSBhcyB7XG5cdFtrZXk6IHN0cmluZ106IHVua25vd247XG5cdFBhcmFtSGFuZGxpbmdNb2RlOiB0eXBlb2YgUGFyYW1IYW5kbGluZ01vZGU7XG5cdE5hdlR5cGU6IHR5cGVvZiBOYXZUeXBlO1xuXHRTdXBwcmVzc2lvbkJlaGF2aW9yOiB0eXBlb2YgU3VwcHJlc3Npb25CZWhhdmlvcjtcblx0TW9kZTogdHlwZW9mIE1vZGU7XG59O1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIHN1Y2Nlc3NvciBvZiB7QGxpbmsgc2FwLnVpLmdlbmVyaWMuYXBwLm5hdmlnYXRpb24uc2VydmljZS5QYXJhbUhhbmRsaW5nTW9kZX0uPGJyPlxuICogQSBzdGF0aWMgZW51bWVyYXRpb24gdHlwZSB3aGljaCBpbmRpY2F0ZXMgdGhlIGNvbmZsaWN0IHJlc29sdXRpb24gbWV0aG9kIHdoZW4gbWVyZ2luZyBVUkwgcGFyYW1ldGVycyBpbnRvIHNlbGVjdCBvcHRpb25zLlxuICpcbiAqIEBwdWJsaWNcbiAqIEBuYW1lIHNhcC5mZS5uYXZpZ2F0aW9uLlBhcmFtSGFuZGxpbmdNb2RlXG4gKiBAZW51bSB7c3RyaW5nfVxuICogQHJlYWRvbmx5XG4gKiBAc2luY2UgMS44My4wXG4gKi9cbnRoaXNMaWIuUGFyYW1IYW5kbGluZ01vZGUgPSBQYXJhbUhhbmRsaW5nTW9kZTtcblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBzdWNjZXNzb3Igb2Yge0BsaW5rIHNhcC51aS5nZW5lcmljLmFwcC5uYXZpZ2F0aW9uLnNlcnZpY2UuTmF2VHlwZX0uPGJyPlxuICogQSBzdGF0aWMgZW51bWVyYXRpb24gdHlwZSB3aGljaCBpbmRpY2F0ZXMgdGhlIHR5cGUgb2YgaW5ib3VuZCBuYXZpZ2F0aW9uLlxuICpcbiAqIEBwdWJsaWNcbiAqIEBuYW1lIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdlR5cGVcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcmVhZG9ubHlcbiAqIEBzaW5jZSAxLjgzLjBcbiAqL1xudGhpc0xpYi5OYXZUeXBlID0gTmF2VHlwZTtcblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBzdWNjZXNzb3Igb2Yge0BsaW5rIHNhcC51aS5nZW5lcmljLmFwcC5uYXZpZ2F0aW9uLnNlcnZpY2UuU3VwcHJlc3Npb25CZWhhdmlvcn0uPGJyPlxuICogQSBzdGF0aWMgZW51bWVyYXRpb24gdHlwZSB3aGljaCBpbmRpY2F0ZXMgd2hldGhlciBzZW1hbnRpYyBhdHRyaWJ1dGVzIHdpdGggdmFsdWVzIDxjb2RlPm51bGw8L2NvZGU+LFxuICogPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBvciA8Y29kZT5cIlwiPC9jb2RlPiAoZW1wdHkgc3RyaW5nKSBzaGFsbCBiZSBzdXBwcmVzc2VkLCBiZWZvcmUgdGhleSBhcmUgbWl4ZWQgaW4gdG8gdGhlIHNlbGVjdGlvbiB2YXJpYW50IGluIHRoZVxuICogbWV0aG9kIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlci5taXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCBtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudH1cbiAqIG9mIHRoZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIgTmF2aWdhdGlvbkhhbmRsZXJ9LlxuICpcbiAqIEBwdWJsaWNcbiAqIEBuYW1lIHNhcC5mZS5uYXZpZ2F0aW9uLlN1cHByZXNzaW9uQmVoYXZpb3JcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcmVhZG9ubHlcbiAqIEBzaW5jZSAxLjgzLjBcbiAqL1xudGhpc0xpYi5TdXBwcmVzc2lvbkJlaGF2aW9yID0gU3VwcHJlc3Npb25CZWhhdmlvcjtcblxuLyoqXG4gKiBBIHN0YXRpYyBlbnVtZXJhdGlvbiB0eXBlIHdoaWNoIGluZGljYXRlcyB0aGUgT2RhdGEgdmVyc2lvbiB1c2VkIGZvciBydW5ubmluZyB0aGUgTmF2aWdhdGlvbiBIYW5kbGVyLlxuICpcbiAqIEBwdWJsaWNcbiAqIEBuYW1lIHNhcC5mZS5uYXZpZ2F0aW9uLk1vZGVcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcmVhZG9ubHlcbiAqIEBzaW5jZSAxLjgzLjBcbiAqL1xudGhpc0xpYi5Nb2RlID0gTW9kZTtcblxuZXhwb3J0IGRlZmF1bHQgdGhpc0xpYjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQUdBLE1BQU1BLGlCQUFpQixHQUFHO0lBQ3pCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsVUFBVSxFQUFFLFlBQVk7SUFFeEI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsWUFBWSxFQUFFLGNBQWM7SUFFNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxjQUFjLEVBQUU7RUFDakIsQ0FBVTtFQUVWLE1BQU1DLE9BQU8sR0FBRztJQUNmO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsT0FBTyxFQUFFLFNBQVM7SUFFbEI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxTQUFTLEVBQUUsV0FBVztJQUV0QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLFNBQVMsRUFBRSxXQUFXO0lBRXRCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsU0FBUyxFQUFFO0VBQ1osQ0FBVTtFQUVWLE1BQU1DLG1CQUFtQixHQUFHO0lBQzNCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxRQUFRLEVBQUUsQ0FBQztJQUVYO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxpQkFBaUIsRUFBRSxDQUFDO0lBRXBCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsZ0JBQWdCLEVBQUUsQ0FBQztJQUVuQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHFCQUFxQixFQUFFO0VBQ3hCLENBQVU7RUFFVixNQUFNQyxJQUFJLEdBQUc7SUFDWjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLE9BQU8sRUFBRSxTQUFTO0lBRWxCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsT0FBTyxFQUFFO0VBQ1YsQ0FBVTs7RUFFVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUMsT0FBTyxHQUFHQyxJQUFJLENBQUNDLFdBQVcsQ0FBQztJQUNoQ0MsSUFBSSxFQUFFLG1CQUFtQjtJQUN6QjtJQUNBQyxPQUFPLEVBQUUsWUFBWTtJQUNyQkMsWUFBWSxFQUFFLENBQUMsYUFBYSxDQUFDO0lBQzdCQyxLQUFLLEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxxQ0FBcUMsRUFBRSx1Q0FBdUMsQ0FBQztJQUNwSEMsVUFBVSxFQUFFLEVBQUU7SUFDZEMsUUFBUSxFQUFFLEVBQUU7SUFDWkMsUUFBUSxFQUFFLEVBQUU7SUFDWkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQU1BOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0FWLE9BQU8sQ0FBQ2pCLGlCQUFpQixHQUFHQSxpQkFBaUI7O0VBRTdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0FpQixPQUFPLENBQUNiLE9BQU8sR0FBR0EsT0FBTzs7RUFFekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQWEsT0FBTyxDQUFDUixtQkFBbUIsR0FBR0EsbUJBQW1COztFQUVqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQVEsT0FBTyxDQUFDSCxJQUFJLEdBQUdBLElBQUk7RUFBQyxPQUVMRyxPQUFPO0FBQUEifQ==