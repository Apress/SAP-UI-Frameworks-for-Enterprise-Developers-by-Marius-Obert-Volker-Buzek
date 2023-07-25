/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/core/Control","./HorizontalDividerRenderer"],function(e,r,i){"use strict";var a=e.HorizontalDividerHeight;var o=e.HorizontalDividerType;var t=r.extend("sap.ui.commons.HorizontalDivider",{metadata:{library:"sap.ui.commons",deprecated:true,properties:{width:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"100%"},type:{type:"sap.ui.commons.HorizontalDividerType",group:"Appearance",defaultValue:o.Area},height:{type:"sap.ui.commons.HorizontalDividerHeight",group:"Appearance",defaultValue:a.Medium}}}});return t});