/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(function(){"use strict";return function(i){var n=false;var e;var t;var r;var f=new Promise(function(e,f){i(function(){if(!n){e.apply(this,arguments)}else if(t){t.apply(this,arguments)}},function(){if(!n){f.apply(this,arguments)}else if(r){r.apply(this,arguments)}})});return{promise:f,cancel:function(){n=true;if(!e){e=new Promise(function(i,n){t=i;r=n})}return e}}}});