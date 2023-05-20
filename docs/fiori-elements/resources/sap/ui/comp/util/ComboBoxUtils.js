/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/util/FormatUtil"],function(i){"use strict";return{formatDisplayBehaviour:function(e,n){var r,t,a,u,s,o,g;if(e===null||e===undefined||!n){return}o=e.getKey();g=e&&e.getBinding("text");if(o!==""&&g&&Array.isArray(g.aBindings)){u=g.aBindings[0];s=g.aBindings[1];t=u&&u.getValue();a=s&&s.getValue();if(o!==t){return}r=i.getFormattedExpressionFromDisplayBehaviour(n,t,a)}return r}}});