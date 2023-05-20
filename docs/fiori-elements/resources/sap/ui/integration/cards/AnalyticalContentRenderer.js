/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./BaseContentRenderer"],function(e){"use strict";var n=e.extend("sap.ui.integration.cards.AnalyticalContentRenderer",{apiVersion:2,MIN_ANALYTICAL_CONTENT_HEIGHT:"14rem"});n.getMinHeight=function(e,t){if(e.minHeight){return e.minHeight}return n.MIN_ANALYTICAL_CONTENT_HEIGHT};return n});