/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./SortFlex","./ColumnFlex","./ConditionFlex","./GroupFlex","./AggregateFlex","./xConfigFlex"],function(e,o,r,d,t,n){"use strict";return{hideControl:"default",unhideControl:"default",addColumn:o.createAddChangeHandler(),removeColumn:o.createRemoveChangeHandler(),moveColumn:o.createMoveChangeHandler(),removeSort:e.removeSort,addSort:e.addSort,moveSort:e.moveSort,addCondition:r.addCondition,removeCondition:r.removeCondition,removeGroup:d.removeGroup,addGroup:d.addGroup,moveGroup:d.moveGroup,removeAggregate:t.removeAggregate,addAggregate:t.addAggregate,setColumnWidth:n.createSetChangeHandler({aggregation:"columns",property:"width"})}});