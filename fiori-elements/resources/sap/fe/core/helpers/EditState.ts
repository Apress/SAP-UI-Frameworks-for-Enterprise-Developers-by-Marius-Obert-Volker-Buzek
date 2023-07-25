const enumEditState = {
	CLEAN: 0,
	PROCESSED: 1,
	DIRTY: 2
};
let currentEditState = enumEditState.CLEAN;

export default {
	/**
	 * This sets the edit state as dirty, meaning bindings have to be refreshed.
	 *
	 * @function
	 * @name sap.fe.core.helpers.EditState#setEditStateDirty
	 * @memberof sap.fe.core.helpers.EditState
	 * @ui5-restricted
	 * @final
	 */
	setEditStateDirty: function () {
		currentEditState = enumEditState.DIRTY;
	},

	/**
	 * This sets the edit state as processed, meaning is can be reset to clean after all bindings are refreshed.
	 *
	 * @function
	 * @name sap.fe.core.helpers.EditState#setEditStateProcessed
	 * @memberof sap.fe.core.helpers.EditState
	 * @ui5-restricted
	 * @final
	 */
	setEditStateProcessed: function () {
		currentEditState = enumEditState.PROCESSED;
	},

	/**
	 * Resets the edit state to the initial state.
	 *
	 * @function
	 * @name sap.fe.core.helpers.EditState#resetEditState
	 * @memberof sap.fe.core.helpers.EditState
	 * @ui5-restricted
	 * @final
	 */
	resetEditState: function () {
		currentEditState = enumEditState.CLEAN;
	},

	/**
	 * Returns true if the edit state is not clean, meaning bindings have to be refreshed
	 *
	 * @function
	 * @name sap.fe.core.helpers.EditState#isEditStateDirty
	 * @memberof sap.fe.core.helpers.EditState
	 * @ui5-restricted
	 * @final
	 */

	isEditStateDirty: function () {
		return currentEditState !== enumEditState.CLEAN;
	},

	/**
	 * Cleans the edit state if it has been processed, i.e. bindings have been properly refreshed.
	 *
	 * @function
	 * @name sap.fe.core.helpers.EditState#cleanProcessedEditState
	 * @memberof sap.fe.core.helpers.EditState
	 * @ui5-restricted
	 * @final
	 */
	cleanProcessedEditState: function () {
		if (currentEditState === enumEditState.PROCESSED) {
			currentEditState = enumEditState.CLEAN;
		}
	}
};
