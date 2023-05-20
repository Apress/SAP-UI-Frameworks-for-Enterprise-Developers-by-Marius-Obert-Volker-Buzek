/**
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/base/Object","sap/collaboration/components/utils/LanguageBundle","sap/ui/core/format/DateFormat"],function(t,e,a){"use strict";var o=t.extend("sap.collaboration.components.util.DateUtil",{constructor:function(){this._oLanguageBundle=new e},formatDateToString:function(t){var e=a.getDateInstance({style:"short",relative:true},sap.ui.getCore().getConfiguration().getLocale());var o=a.getTimeInstance({style:"short"},sap.ui.getCore().getConfiguration().getLocale());var n=e.format(t)+" "+this._oLanguageBundle.getText("ST_GROUP_SELECT_AT")+" "+o.format(t);var r=/[A-Za-z]/;if(n.charAt(0).match(r)){n=n.charAt(0).toUpperCase()+n.slice(1)}return n}});return o});