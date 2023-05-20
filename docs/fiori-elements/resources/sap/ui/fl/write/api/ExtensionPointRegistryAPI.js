/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/write/_internal/extensionPoint/Registry"],function(n){"use strict";var t={getExtensionPointInfo:function(t){return n.getExtensionPointInfo(t.name,t.view)},getExtensionPointInfoByViewId:function(t){return n.getExtensionPointInfoByViewId(t.viewId)},getExtensionPointInfoByParentId:function(t){return n.getExtensionPointInfoByParentId(t.parentId)}};return t});