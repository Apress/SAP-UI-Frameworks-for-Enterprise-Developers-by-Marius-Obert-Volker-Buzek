/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./FilterItemFlex","./ConditionFlex","./PropertyInfoFlex"],function(e,n,o){"use strict";return{addFilter:e.createAddChangeHandler(),removeFilter:e.createRemoveChangeHandler(),moveFilter:e.createMoveChangeHandler(),addCondition:n.addCondition,removeCondition:n.removeCondition,addPropertyInfo:o.addPropertyInfo}},true);