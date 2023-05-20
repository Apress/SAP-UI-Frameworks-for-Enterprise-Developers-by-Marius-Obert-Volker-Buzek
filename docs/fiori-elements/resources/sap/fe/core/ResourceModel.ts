import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import UI5ResourceModel from "sap/ui/model/resource/ResourceModel";

type InternalResourceBundle = ResourceBundle & {
	aCustomBundles: InternalResourceBundle[];
};

@defineUI5Class("sap.fe.core.ResourceModel")
class ResourceModel extends UI5ResourceModel {
	private _oResourceBundle!: InternalResourceBundle;

	/**
	 * Returns text for a given resource key.
	 *
	 * @param textID ID of the Text
	 * @param parameters Array of parameters that are used to create the text
	 * @param metaPath Entity set name or action name to overload a text
	 * @returns Determined text
	 */
	getText(textID: string, parameters?: unknown[], metaPath?: string): string {
		let resourceKey = textID;
		const resourceBundle = this._oResourceBundle;

		if (metaPath) {
			const resourceKeyExists = this.checkIfResourceKeyExists(`${resourceKey}|${metaPath}`);

			// if resource key with metapath (i.e. entity set name) for instance specific text overriding is provided by the application
			// then use the same key otherwise use the Framework key
			resourceKey = resourceKeyExists ? `${resourceKey}|${metaPath}` : resourceKey;
		}

		return resourceBundle?.getText(resourceKey, parameters, true) || textID;
	}

	/**
	 * Check if a text exists for a given resource key.
	 *
	 * @param textID ID of the Text
	 * @returns True in case the text exists
	 */
	checkIfResourceKeyExists(textID: string) {
		// There are console errors logged when making calls to getText for keys that are not defined in the resource bundle
		// for instance keys which are supposed to be provided by the application, e.g, <key>|<entitySet> to override instance specific text
		// hence check if text exists (using "hasText") in the resource bundle before calling "getText"

		// "hasText" only checks for the key in the immediate resource bundle and not it's custom bundles
		// hence we need to do this recurrsively to check if the key exists in any of the bundles the forms the FE resource bundle
		return this._checkIfResourceKeyExists(textID, this._oResourceBundle.aCustomBundles);
	}

	_checkIfResourceKeyExists(textID: string, bundles?: InternalResourceBundle[]) {
		if (bundles?.length) {
			for (let i = bundles.length - 1; i >= 0; i--) {
				const sValue = bundles[i].hasText(textID);
				// text found return true
				if (sValue) {
					return true;
				}
				this._checkIfResourceKeyExists(textID, bundles[i].aCustomBundles);
			}
		}
		return false;
	}
}

export default ResourceModel;
