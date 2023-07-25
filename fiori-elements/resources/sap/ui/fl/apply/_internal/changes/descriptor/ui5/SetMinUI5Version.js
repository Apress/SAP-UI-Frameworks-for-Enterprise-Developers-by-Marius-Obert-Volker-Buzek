/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/Version"],function(e){"use strict";var n={applyChange:function(n,i){var s=new e(n["sap.ui5"].dependencies.minUI5Version);if(s.compareTo(i.getContent().minUI5Version)<=0){n["sap.ui5"].dependencies.minUI5Version=i.getContent().minUI5Version}return n}};return n});