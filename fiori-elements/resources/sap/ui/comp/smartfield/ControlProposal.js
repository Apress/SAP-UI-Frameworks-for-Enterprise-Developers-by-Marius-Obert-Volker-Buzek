/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/library","sap/ui/core/Element"],function(e,a){"use strict";var t=e.smartfield.ControlProposalType;var o=a.extend("sap.ui.comp.smartfield.ControlProposal",{metadata:{library:"sap.ui.comp",properties:{controlType:{type:"sap.ui.comp.smartfield.ControlProposalType",group:"Misc",defaultValue:t.None}},aggregations:{objectStatus:{type:"sap.ui.comp.smartfield.ObjectStatus",multiple:false}}}});return o});