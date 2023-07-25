/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	"sap/ui/comp/smartform/flexibility/changes/RemoveGroup",
	"sap/ui/comp/smartform/flexibility/changes/AddGroup",
	"sap/ui/comp/smartform/flexibility/changes/MoveGroups",
	"sap/ui/comp/smartform/flexibility/changes/RenameTitle",
	"sap/ui/comp/smartform/flexibility/changes/CombineFields",
	"sap/ui/comp/smartform/flexibility/changes/SplitField",
	"sap/ui/comp/smartform/flexibility/changes/MoveFields"
], function (
	RemoveGroup,
	AddGroup,
	MoveGroups,
	RenameTitle,
	CombineFields,
	SplitField,
	MoveFields
) {
	"use strict";

	return {
		"removeGroup": RemoveGroup,
		"addGroup": AddGroup,
		"moveGroups": MoveGroups,
		"renameField": RenameTitle,
		"combineFields": CombineFields,
		"splitField": SplitField,
		"moveControls": MoveFields
	};
}, /* bExport= */ true);
