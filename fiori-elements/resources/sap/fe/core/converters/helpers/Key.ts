import type { DataFieldAbstractTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { getStableIdPartFromDataField } from "../../helpers/StableIdHelper";

/**
 * The KeyHelper is used for dealing with Key in the concern of the flexible programming model
 */
export class KeyHelper {
	/**
	 * Returns a generated key for DataFields to be used in the flexible programming model.
	 *
	 * @param dataField DataField to generate the key for
	 * @returns Returns a through StableIdHelper generated key
	 */
	static generateKeyFromDataField(dataField: DataFieldAbstractTypes): string {
		return getStableIdPartFromDataField(dataField, true)!;
	}

	/**
	 * Throws a Error if any other character then aA-zZ, 0-9, ':', '_' or '-' is used.
	 *
	 * @param key String to check validity on
	 */
	static validateKey(key: string) {
		const pattern = /[^A-Za-z0-9_\-:]/;
		if (pattern.exec(key)) {
			throw new Error(`Invalid key: ${key} - only 'A-Za-z0-9_-:' are allowed`);
		}
	}

	/**
	 * Returns the key for a selection field required for adaption.
	 *
	 * @param fullPropertyPath The full property path (without entityType)
	 * @returns The key of the selection field
	 */
	static getSelectionFieldKeyFromPath(fullPropertyPath: string) {
		return fullPropertyPath.replace(/([*+])?\//g, "::");
	}

	/**
	 * Returns the path for a selection field required for adaption.
	 *
	 * @param selectionFieldKey The key of the selection field
	 * @returns The full property path
	 */
	static getPathFromSelectionFieldKey(selectionFieldKey: string) {
		return selectionFieldKey.replace(/::/g, "/");
	}
}
