/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/registry/Settings"],function(e){"use strict";return function(){return e.getInstance().then(function(e){return Object.keys(e._oSettings).map(function(t){var n=e._oSettings[t];switch(t){case"versioning":n=n.CUSTOMER||n.ALL;break;default:break}return{key:t,value:n}})})}});