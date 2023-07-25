/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  const TableScroller = {
    /**
     * Scrolls an MDC table to a given row, identified by its context path.
     * If the row with the path can't be found, the table stays unchanged.
     *
     * @param oTable The table to be scrolled
     * @param sRowPath The path identifying the row to scroll to
     */
    scrollTableToRow: function (oTable, sRowPath) {
      const oTableRowBinding = oTable.getRowBinding();
      const getTableContexts = function () {
        if (oTable.data().tableType === "GridTable") {
          return oTableRowBinding.getContexts(0);
        } else {
          return oTableRowBinding.getCurrentContexts();
        }
      };
      const findAndScroll = function () {
        const oTableRow = getTableContexts().find(function (item) {
          return item && item.getPath() === sRowPath;
        });
        if (oTableRow) {
          oTable.scrollToIndex(oTableRow.getIndex());
        }
      };
      if (oTableRowBinding) {
        const oTableRowBindingContexts = getTableContexts();
        if (oTableRowBindingContexts.length === 0 && oTableRowBinding.getLength() > 0 || oTableRowBindingContexts.some(function (context) {
          return context === undefined;
        })) {
          // The contexts are not loaded yet --> wait for a change event before scrolling
          oTableRowBinding.attachEventOnce("dataReceived", findAndScroll);
        } else {
          // Contexts are already loaded --> we can try to scroll immediately
          findAndScroll();
        }
      }
    }
  };
  return TableScroller;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWJsZVNjcm9sbGVyIiwic2Nyb2xsVGFibGVUb1JvdyIsIm9UYWJsZSIsInNSb3dQYXRoIiwib1RhYmxlUm93QmluZGluZyIsImdldFJvd0JpbmRpbmciLCJnZXRUYWJsZUNvbnRleHRzIiwiZGF0YSIsInRhYmxlVHlwZSIsImdldENvbnRleHRzIiwiZ2V0Q3VycmVudENvbnRleHRzIiwiZmluZEFuZFNjcm9sbCIsIm9UYWJsZVJvdyIsImZpbmQiLCJpdGVtIiwiZ2V0UGF0aCIsInNjcm9sbFRvSW5kZXgiLCJnZXRJbmRleCIsIm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cyIsImxlbmd0aCIsImdldExlbmd0aCIsInNvbWUiLCJjb250ZXh0IiwidW5kZWZpbmVkIiwiYXR0YWNoRXZlbnRPbmNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZVNjcm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFRhYmxlU2Nyb2xsZXIgPSB7XG5cdC8qKlxuXHQgKiBTY3JvbGxzIGFuIE1EQyB0YWJsZSB0byBhIGdpdmVuIHJvdywgaWRlbnRpZmllZCBieSBpdHMgY29udGV4dCBwYXRoLlxuXHQgKiBJZiB0aGUgcm93IHdpdGggdGhlIHBhdGggY2FuJ3QgYmUgZm91bmQsIHRoZSB0YWJsZSBzdGF5cyB1bmNoYW5nZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGFibGUgVGhlIHRhYmxlIHRvIGJlIHNjcm9sbGVkXG5cdCAqIEBwYXJhbSBzUm93UGF0aCBUaGUgcGF0aCBpZGVudGlmeWluZyB0aGUgcm93IHRvIHNjcm9sbCB0b1xuXHQgKi9cblx0c2Nyb2xsVGFibGVUb1JvdzogZnVuY3Rpb24gKG9UYWJsZTogYW55LCBzUm93UGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb1RhYmxlUm93QmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cblx0XHRjb25zdCBnZXRUYWJsZUNvbnRleHRzID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKG9UYWJsZS5kYXRhKCkudGFibGVUeXBlID09PSBcIkdyaWRUYWJsZVwiKSB7XG5cdFx0XHRcdHJldHVybiBvVGFibGVSb3dCaW5kaW5nLmdldENvbnRleHRzKDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG9UYWJsZVJvd0JpbmRpbmcuZ2V0Q3VycmVudENvbnRleHRzKCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGNvbnN0IGZpbmRBbmRTY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBvVGFibGVSb3cgPSBnZXRUYWJsZUNvbnRleHRzKCkuZmluZChmdW5jdGlvbiAoaXRlbTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBpdGVtICYmIGl0ZW0uZ2V0UGF0aCgpID09PSBzUm93UGF0aDtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKG9UYWJsZVJvdykge1xuXHRcdFx0XHRvVGFibGUuc2Nyb2xsVG9JbmRleChvVGFibGVSb3cuZ2V0SW5kZXgoKSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChvVGFibGVSb3dCaW5kaW5nKSB7XG5cdFx0XHRjb25zdCBvVGFibGVSb3dCaW5kaW5nQ29udGV4dHMgPSBnZXRUYWJsZUNvbnRleHRzKCk7XG5cblx0XHRcdGlmIChcblx0XHRcdFx0KG9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cy5sZW5ndGggPT09IDAgJiYgb1RhYmxlUm93QmluZGluZy5nZXRMZW5ndGgoKSA+IDApIHx8XG5cdFx0XHRcdG9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cy5zb21lKGZ1bmN0aW9uIChjb250ZXh0OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gY29udGV4dCA9PT0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9KVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIFRoZSBjb250ZXh0cyBhcmUgbm90IGxvYWRlZCB5ZXQgLS0+IHdhaXQgZm9yIGEgY2hhbmdlIGV2ZW50IGJlZm9yZSBzY3JvbGxpbmdcblx0XHRcdFx0b1RhYmxlUm93QmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgZmluZEFuZFNjcm9sbCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBDb250ZXh0cyBhcmUgYWxyZWFkeSBsb2FkZWQgLS0+IHdlIGNhbiB0cnkgdG8gc2Nyb2xsIGltbWVkaWF0ZWx5XG5cdFx0XHRcdGZpbmRBbmRTY3JvbGwoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRhYmxlU2Nyb2xsZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFBQSxNQUFNQSxhQUFhLEdBQUc7SUFDckI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsZ0JBQWdCLEVBQUUsVUFBVUMsTUFBVyxFQUFFQyxRQUFnQixFQUFFO01BQzFELE1BQU1DLGdCQUFnQixHQUFHRixNQUFNLENBQUNHLGFBQWEsRUFBRTtNQUUvQyxNQUFNQyxnQkFBZ0IsR0FBRyxZQUFZO1FBQ3BDLElBQUlKLE1BQU0sQ0FBQ0ssSUFBSSxFQUFFLENBQUNDLFNBQVMsS0FBSyxXQUFXLEVBQUU7VUFDNUMsT0FBT0osZ0JBQWdCLENBQUNLLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDdkMsQ0FBQyxNQUFNO1VBQ04sT0FBT0wsZ0JBQWdCLENBQUNNLGtCQUFrQixFQUFFO1FBQzdDO01BQ0QsQ0FBQztNQUVELE1BQU1DLGFBQWEsR0FBRyxZQUFZO1FBQ2pDLE1BQU1DLFNBQVMsR0FBR04sZ0JBQWdCLEVBQUUsQ0FBQ08sSUFBSSxDQUFDLFVBQVVDLElBQVMsRUFBRTtVQUM5RCxPQUFPQSxJQUFJLElBQUlBLElBQUksQ0FBQ0MsT0FBTyxFQUFFLEtBQUtaLFFBQVE7UUFDM0MsQ0FBQyxDQUFDO1FBQ0YsSUFBSVMsU0FBUyxFQUFFO1VBQ2RWLE1BQU0sQ0FBQ2MsYUFBYSxDQUFDSixTQUFTLENBQUNLLFFBQVEsRUFBRSxDQUFDO1FBQzNDO01BQ0QsQ0FBQztNQUVELElBQUliLGdCQUFnQixFQUFFO1FBQ3JCLE1BQU1jLHdCQUF3QixHQUFHWixnQkFBZ0IsRUFBRTtRQUVuRCxJQUNFWSx3QkFBd0IsQ0FBQ0MsTUFBTSxLQUFLLENBQUMsSUFBSWYsZ0JBQWdCLENBQUNnQixTQUFTLEVBQUUsR0FBRyxDQUFDLElBQzFFRix3QkFBd0IsQ0FBQ0csSUFBSSxDQUFDLFVBQVVDLE9BQVksRUFBRTtVQUNyRCxPQUFPQSxPQUFPLEtBQUtDLFNBQVM7UUFDN0IsQ0FBQyxDQUFDLEVBQ0Q7VUFDRDtVQUNBbkIsZ0JBQWdCLENBQUNvQixlQUFlLENBQUMsY0FBYyxFQUFFYixhQUFhLENBQUM7UUFDaEUsQ0FBQyxNQUFNO1VBQ047VUFDQUEsYUFBYSxFQUFFO1FBQ2hCO01BQ0Q7SUFDRDtFQUNELENBQUM7RUFBQyxPQUVhWCxhQUFhO0FBQUEifQ==