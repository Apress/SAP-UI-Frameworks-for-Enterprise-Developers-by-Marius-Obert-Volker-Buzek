import MultiValueFieldDelegate from "sap/ui/mdc/field/MultiValueFieldDelegate";
const oMultiValueFieldDelegate = Object.assign({}, MultiValueFieldDelegate, {
	_transformConditions: function (aConditions: any, sKeyPath: any, sDescriptionPath: any) {
		const aTransformedItems = [];
		for (let i = 0; i < aConditions.length; i++) {
			const oItem: any = {};
			const oCondition = aConditions[i];
			oItem[sKeyPath] = oCondition.values[0];
			if (sDescriptionPath) {
				oItem[sDescriptionPath] = oCondition.values[1];
			}
			aTransformedItems.push(oItem);
		}
		return aTransformedItems;
	},
	updateItems: function (oPayload: any, aConditions: any, oMultiValueField: any) {
		const oListBinding = oMultiValueField.getBinding("items");
		const oBindingInfo = oMultiValueField.getBindingInfo("items");
		const sItemPath = oBindingInfo.path;
		const oTemplate = oBindingInfo.template;
		const oKeyBindingInfo = oTemplate.getBindingInfo("key");
		const sKeyPath = oKeyBindingInfo && oKeyBindingInfo.parts[0].path;
		const oDescriptionBindingInfo = oTemplate.getBindingInfo("description");
		const sDescriptionPath = oDescriptionBindingInfo && oDescriptionBindingInfo.parts[0].path;
		const oModel = oListBinding.getModel();

		oModel.setProperty(sItemPath, this._transformConditions(aConditions, sKeyPath, sDescriptionPath));
	}
});

export default oMultiValueFieldDelegate;
