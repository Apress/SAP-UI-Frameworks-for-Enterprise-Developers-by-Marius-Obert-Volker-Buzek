// This list needs to come from AVT
const ENUM_VALUES = {
	"com.sap.vocabularies.Common.v1.FieldControlType": {
		Mandatory: 7,
		Optional: 3,
		ReadOnly: 0,
		Inapplicable: 0,
		Disabled: 1
	}
};
export const resolveEnumValue = function (enumName: string) {
	const [termName, value] = enumName.split("/");
	if (ENUM_VALUES.hasOwnProperty(termName)) {
		return (ENUM_VALUES as any)[termName][value];
	} else {
		return false;
	}
};
