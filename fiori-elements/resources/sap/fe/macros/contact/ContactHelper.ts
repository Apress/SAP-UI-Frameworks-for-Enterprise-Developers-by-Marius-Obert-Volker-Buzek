import Core from "sap/ui/core/Core";

const oRB = Core.getLibraryResourceBundle("sap.ui.mdc");
const ContactHelper = {
	// emails: first preferred, then work
	// phones : first work, then cell, then fax, then preferred
	// address : first preferred, then work
	formatUri: function (itemType: any, value: any) {
		switch (itemType) {
			case "phone":
				return `tel:${value}`;
			case "mail":
				return `mailto:${value}`;
			default:
				return value;
		}
	},
	formatAddress: function (street: any, code: any, locality: any, region: any, country: any) {
		const textToWrite = [];
		if (street) {
			textToWrite.push(street);
		}
		if (code && locality) {
			textToWrite.push(`${code} ${locality}`);
		} else {
			if (code) {
				textToWrite.push(code);
			}
			if (locality) {
				textToWrite.push(locality);
			}
		}
		if (region) {
			textToWrite.push(region);
		}
		if (country) {
			textToWrite.push(country);
		}
		return textToWrite.join(", ");
	},
	computeLabel: function (itemType: any, subType: any) {
		switch (itemType) {
			case "role":
				return oRB.getText("info.POPOVER_CONTACT_SECTION_ROLE");
			case "title":
				return oRB.getText("info.POPOVER_CONTACT_SECTION_JOBTITLE");
			case "org":
				return oRB.getText("info.POPOVER_CONTACT_SECTION_DEPARTMENT");
			case "phone":
				if (subType.indexOf("fax") > -1) {
					return oRB.getText("info.POPOVER_CONTACT_SECTION_FAX");
				} else if (subType.indexOf("work") > -1) {
					return oRB.getText("info.POPOVER_CONTACT_SECTION_PHONE");
				} else if (subType.indexOf("cell") > -1) {
					return oRB.getText("info.POPOVER_CONTACT_SECTION_MOBILE");
				} else if (subType.indexOf("preferred") > -1) {
					return oRB.getText("info.POPOVER_CONTACT_SECTION_PHONE");
				}
				break;
			case "mail":
				return oRB.getText("info.POPOVER_CONTACT_SECTION_EMAIL");
			case "address":
				return oRB.getText("info.POPOVER_CONTACT_SECTION_ADR");
			default:
				return "contactItem";
		}
	},
	getContactTitle: function () {
		return oRB.getText("info.POPOVER_CONTACT_SECTION_TITLE");
	},
	getAvatarInitials: function (oInitials: any) {
		return oInitials ? oInitials : "";
	}
};

export default ContactHelper;
