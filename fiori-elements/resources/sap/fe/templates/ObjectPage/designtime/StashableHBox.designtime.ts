import Core from "sap/ui/core/Core";

const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.templates");

const StashableHBoxDesignTime = {
	actions: {
		remove: {
			changeType: "stashControl"
		},
		reveal: {
			changeType: "unstashControl"
		},
		rename: function (/*oHeaderFacet: any*/) {
			return {
				changeType: "renameHeaderFacet",
				domRef: function (oControl: any) {
					const oTitleControl = oControl.getTitleControl();
					if (oTitleControl) {
						return oTitleControl.getDomRef();
					} else {
						return null;
					}
				}
			};
		}
	},
	name: {
		singular: function () {
			return oResourceBundle.getText("T_STASHABLE_HBOX_RTA_HEADERFACET_MENU_ADD");
		},
		plural: function () {
			return oResourceBundle.getText("T_STASHABLE_HBOX_RTA_HEADERFACET_MENU_ADD_PLURAL");
		}
	},
	palette: {
		group: "LAYOUT",
		icons: {
			svg: "sap/m/designtime/HBox.icon.svg"
		}
	},
	templates: {
		create: "sap/m/designtime/HBox.create.fragment.xml"
	}
};

export default StashableHBoxDesignTime;
