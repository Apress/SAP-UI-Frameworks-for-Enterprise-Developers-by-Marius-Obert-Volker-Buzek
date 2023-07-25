/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./CardRenderer","sap/ui/integration/widgets/Card"],function(e,r){"use strict";var a=r.extend("sap.ui.integration.designtime.editor.Card",{metadata:{library:"sap.ui.integration",properties:{readonly:{type:"boolean",group:"Behavior",defaultValue:false},readonlyZIndex:{type:"int",group:"Behavior",defaultValue:1}}},renderer:e});return a});