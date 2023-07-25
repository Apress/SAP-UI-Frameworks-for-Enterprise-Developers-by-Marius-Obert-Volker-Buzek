/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/ObjectPath"],function(r){"use strict";function t(t,a){var o=t.propertyPath.split("/");var e=r.get(o,a);if(e&&t.operation==="INSERT"){throw new Error("Path has already a value. 'INSERT' operation is not appropriate.")}if(!e&&t.operation==="UPDATE"){throw new Error("Path does not contain a value. 'UPDATE' operation is not appropriate.")}r.set(o,t.propertyValue,a)}return function(r,a){if(Array.isArray(r)){r.forEach(function(r){t(r,a)})}else{t(r,a)}}});