import Core from "sap/ui/core/Core";

const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.templates");

const StashableVBoxDesignTime = {
	actions: {
		remove: {
			changeType: "stashControl"
		},
		reveal: {
			changeType: "unstashControl"
		}
	},
	name: {
		singular: function () {
			return oResourceBundle.getText("T_STASHABLE_VBOX_RTA_HEADERCOLLECTIONFACET_MENU_ADD");
		},
		plural: function () {
			return oResourceBundle.getText("T_STASHABLE_VBOX_RTA_HEADERCOLLECTIONFACET_MENU_ADD_PLURAL");
		}
	},
	palette: {
		group: "LAYOUT",
		icons: {
			svg: "sap/m/designtime/VBox.icon.svg"
		}
	},
	templates: {
		create: "sap/m/designtime/VBox.create.fragment.xml"
	}
};

export default StashableVBoxDesignTime;
