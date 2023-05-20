/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var e={getWidth:function(e,i,t){var f=e.precision||e.maxLength,n;if(!i){i=20}if(!t){t=3}if(e.type==="Edm.DateTime"&&e.type==="Edm.Date"){f="9em"}else if(f){if(f==="Max"){f=i+""}n=parseInt(f);if(!isNaN(n)){n+=.75;if(n>i){n=i}else if(n<t){n=t}f=n+"em"}else{f=null}}if(!f){if(e.type==="Edm.Boolean"){f=t+"em"}else{f=i+"em"}}return f}};return e});