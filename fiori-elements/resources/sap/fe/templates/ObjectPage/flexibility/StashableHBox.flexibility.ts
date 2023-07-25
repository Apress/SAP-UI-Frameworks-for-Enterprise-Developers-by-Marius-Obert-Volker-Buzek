import BaseRename from "sap/ui/fl/changeHandler/BaseRename";

const StashableHBoxFlexibility = {
	stashControl: "default",
	unstashControl: "default",
	renameHeaderFacet: BaseRename.createRenameChangeHandler({
		propertyName: "title",
		translationTextType: "XFLD",
		changePropertyName: "headerFacetTitle"
	})
};

export default StashableHBoxFlexibility;
