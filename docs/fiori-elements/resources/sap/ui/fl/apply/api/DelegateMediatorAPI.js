/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/DelegateMediator"],function(e){"use strict";var t={registerDefaultDelegate:function(t){e.registerDefaultDelegate(t)},getDelegateForControl:function(t){return e.getDelegateForControl(t.control,t.modifier,t.modelType,t.supportsDefault)},getKnownDefaultDelegateLibraries:function(){return e.getKnownDefaultDelegateLibraries()},getRequiredLibrariesForDefaultDelegate:function(t){return e.getRequiredLibrariesForDefaultDelegate(t.delegateName,t.control,t.modelType)}};return t});