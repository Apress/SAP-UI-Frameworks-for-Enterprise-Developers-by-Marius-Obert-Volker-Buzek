/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  const enumEditState = {
    CLEAN: 0,
    PROCESSED: 1,
    DIRTY: 2
  };
  let currentEditState = enumEditState.CLEAN;
  return {
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
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlbnVtRWRpdFN0YXRlIiwiQ0xFQU4iLCJQUk9DRVNTRUQiLCJESVJUWSIsImN1cnJlbnRFZGl0U3RhdGUiLCJzZXRFZGl0U3RhdGVEaXJ0eSIsInNldEVkaXRTdGF0ZVByb2Nlc3NlZCIsInJlc2V0RWRpdFN0YXRlIiwiaXNFZGl0U3RhdGVEaXJ0eSIsImNsZWFuUHJvY2Vzc2VkRWRpdFN0YXRlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJFZGl0U3RhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZW51bUVkaXRTdGF0ZSA9IHtcblx0Q0xFQU46IDAsXG5cdFBST0NFU1NFRDogMSxcblx0RElSVFk6IDJcbn07XG5sZXQgY3VycmVudEVkaXRTdGF0ZSA9IGVudW1FZGl0U3RhdGUuQ0xFQU47XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0LyoqXG5cdCAqIFRoaXMgc2V0cyB0aGUgZWRpdCBzdGF0ZSBhcyBkaXJ0eSwgbWVhbmluZyBiaW5kaW5ncyBoYXZlIHRvIGJlIHJlZnJlc2hlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLmhlbHBlcnMuRWRpdFN0YXRlI3NldEVkaXRTdGF0ZURpcnR5XG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5oZWxwZXJzLkVkaXRTdGF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRzZXRFZGl0U3RhdGVEaXJ0eTogZnVuY3Rpb24gKCkge1xuXHRcdGN1cnJlbnRFZGl0U3RhdGUgPSBlbnVtRWRpdFN0YXRlLkRJUlRZO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIHNldHMgdGhlIGVkaXQgc3RhdGUgYXMgcHJvY2Vzc2VkLCBtZWFuaW5nIGlzIGNhbiBiZSByZXNldCB0byBjbGVhbiBhZnRlciBhbGwgYmluZGluZ3MgYXJlIHJlZnJlc2hlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLmhlbHBlcnMuRWRpdFN0YXRlI3NldEVkaXRTdGF0ZVByb2Nlc3NlZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuaGVscGVycy5FZGl0U3RhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0c2V0RWRpdFN0YXRlUHJvY2Vzc2VkOiBmdW5jdGlvbiAoKSB7XG5cdFx0Y3VycmVudEVkaXRTdGF0ZSA9IGVudW1FZGl0U3RhdGUuUFJPQ0VTU0VEO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXNldHMgdGhlIGVkaXQgc3RhdGUgdG8gdGhlIGluaXRpYWwgc3RhdGUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5oZWxwZXJzLkVkaXRTdGF0ZSNyZXNldEVkaXRTdGF0ZVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuaGVscGVycy5FZGl0U3RhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0cmVzZXRFZGl0U3RhdGU6IGZ1bmN0aW9uICgpIHtcblx0XHRjdXJyZW50RWRpdFN0YXRlID0gZW51bUVkaXRTdGF0ZS5DTEVBTjtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoZSBlZGl0IHN0YXRlIGlzIG5vdCBjbGVhbiwgbWVhbmluZyBiaW5kaW5ncyBoYXZlIHRvIGJlIHJlZnJlc2hlZFxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuaGVscGVycy5FZGl0U3RhdGUjaXNFZGl0U3RhdGVEaXJ0eVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuaGVscGVycy5FZGl0U3RhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblxuXHRpc0VkaXRTdGF0ZURpcnR5OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIGN1cnJlbnRFZGl0U3RhdGUgIT09IGVudW1FZGl0U3RhdGUuQ0xFQU47XG5cdH0sXG5cblx0LyoqXG5cdCAqIENsZWFucyB0aGUgZWRpdCBzdGF0ZSBpZiBpdCBoYXMgYmVlbiBwcm9jZXNzZWQsIGkuZS4gYmluZGluZ3MgaGF2ZSBiZWVuIHByb3Blcmx5IHJlZnJlc2hlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLmhlbHBlcnMuRWRpdFN0YXRlI2NsZWFuUHJvY2Vzc2VkRWRpdFN0YXRlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5oZWxwZXJzLkVkaXRTdGF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRjbGVhblByb2Nlc3NlZEVkaXRTdGF0ZTogZnVuY3Rpb24gKCkge1xuXHRcdGlmIChjdXJyZW50RWRpdFN0YXRlID09PSBlbnVtRWRpdFN0YXRlLlBST0NFU1NFRCkge1xuXHRcdFx0Y3VycmVudEVkaXRTdGF0ZSA9IGVudW1FZGl0U3RhdGUuQ0xFQU47XG5cdFx0fVxuXHR9XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBQUEsTUFBTUEsYUFBYSxHQUFHO0lBQ3JCQyxLQUFLLEVBQUUsQ0FBQztJQUNSQyxTQUFTLEVBQUUsQ0FBQztJQUNaQyxLQUFLLEVBQUU7RUFDUixDQUFDO0VBQ0QsSUFBSUMsZ0JBQWdCLEdBQUdKLGFBQWEsQ0FBQ0MsS0FBSztFQUFDLE9BRTVCO0lBQ2Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NJLGlCQUFpQixFQUFFLFlBQVk7TUFDOUJELGdCQUFnQixHQUFHSixhQUFhLENBQUNHLEtBQUs7SUFDdkMsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDRyxxQkFBcUIsRUFBRSxZQUFZO01BQ2xDRixnQkFBZ0IsR0FBR0osYUFBYSxDQUFDRSxTQUFTO0lBQzNDLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0ssY0FBYyxFQUFFLFlBQVk7TUFDM0JILGdCQUFnQixHQUFHSixhQUFhLENBQUNDLEtBQUs7SUFDdkMsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7SUFFQ08sZ0JBQWdCLEVBQUUsWUFBWTtNQUM3QixPQUFPSixnQkFBZ0IsS0FBS0osYUFBYSxDQUFDQyxLQUFLO0lBQ2hELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ1EsdUJBQXVCLEVBQUUsWUFBWTtNQUNwQyxJQUFJTCxnQkFBZ0IsS0FBS0osYUFBYSxDQUFDRSxTQUFTLEVBQUU7UUFDakRFLGdCQUFnQixHQUFHSixhQUFhLENBQUNDLEtBQUs7TUFDdkM7SUFDRDtFQUNELENBQUM7QUFBQSJ9