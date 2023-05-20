/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/DataType"],function(e){"use strict";var r={replace:function(r){var t=e.getType("sap.ui.core.ID");if(!t.isValid(r)){r=r.replace(/[^A-Za-z0-9_.:]+/g,"__mdc__");if(!t.isValid(r)){r="__mdc__"+r}}return r},getFilterFieldId:function(e,t){return e.getId()+"--filter--"+r.replace(t)},getPropertyKey:function(e){return e.name},getPropertyPath:function(e){return e.path},getView:function(e){var r=null;if(e){var t=e.getParent();while(t){if(t.isA("sap.ui.core.mvc.View")){r=t;break}t=t.getParent()}}return r}};return r});