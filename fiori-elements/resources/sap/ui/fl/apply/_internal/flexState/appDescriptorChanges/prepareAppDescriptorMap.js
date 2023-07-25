/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory"],function(e){"use strict";return function(n){var r=n.storageResponse.changes.appDescriptorChanges||[];var t=r.map(function(n){return e.createFromFileContent(n)});return{appDescriptorChanges:t}}});