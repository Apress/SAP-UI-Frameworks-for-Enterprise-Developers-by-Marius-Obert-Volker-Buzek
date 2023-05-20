/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./BaseContentRenderer"],function(e){"use strict";var n=e.extend("sap.ui.integration.cards.ComponentContentRenderer",{apiVersion:2});n.getMinHeight=function(n,t){if(n.minHeight){return n.minHeight}return e.getMinHeight.apply(this,arguments)};return n});