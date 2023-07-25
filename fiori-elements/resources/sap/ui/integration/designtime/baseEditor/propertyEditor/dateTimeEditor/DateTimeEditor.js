/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor","sap/ui/integration/designtime/baseEditor/propertyEditor/dateEditor/DateEditor","sap/ui/core/format/DateFormat"],function(t,e,r){"use strict";var i=e.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.dateTimeEditor.DateTimeEditor",{xmlFragment:"sap.ui.integration.designtime.baseEditor.propertyEditor.dateTimeEditor.DateTimeEditor",metadata:{library:"sap.ui.integration"},renderer:t.getMetadata().getRenderer().render});i.prototype.getFormatterInstance=function(t){return r.getDateTimeInstance(t||{pattern:"YYYY-MM-dd'T'HH:mm:ss.SSSSZ"})};i.configMetadata=Object.assign({},e.configMetadata,{typeLabel:{defaultValue:"BASE_EDITOR.TYPES.DATETIME"},utc:{defaultValue:true}});return i});