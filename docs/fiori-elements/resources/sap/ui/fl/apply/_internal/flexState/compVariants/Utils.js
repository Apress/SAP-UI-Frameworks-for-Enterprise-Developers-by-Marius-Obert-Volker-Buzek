/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var e={};e.getPersistencyKey=function(e){if(e){var t=e.getVariantManagement&&e.getVariantManagement()||e;if(t.getPersonalizableControlPersistencyKey){return t.getPersonalizableControlPersistencyKey()}return t.getPersistencyKey&&t.getPersistencyKey()}};return e});