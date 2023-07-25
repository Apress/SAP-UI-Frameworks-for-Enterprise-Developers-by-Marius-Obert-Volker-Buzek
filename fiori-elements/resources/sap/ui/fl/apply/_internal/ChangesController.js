/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/FlexControllerFactory","sap/ui/fl/apply/_internal/flexState/ManifestUtils","sap/ui/fl/Utils"],function(t,e,n){"use strict";var r={getFlexControllerInstance:function(e){if(typeof e==="string"){return t.create(e)}if(typeof e.appId==="string"){return t.create(e.appId)}var n=e.appComponent||e;return t.createForControl(n)},getAppComponentForSelector:function(t){if(typeof t.appId==="string"){return t}return t.appComponent||n.getAppComponentForControl(t)}};return r});