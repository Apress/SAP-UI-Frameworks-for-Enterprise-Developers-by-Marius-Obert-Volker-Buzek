const TableScroller = {
	/**
	 * Scrolls an MDC table to a given row, identified by its context path.
	 * If the row with the path can't be found, the table stays unchanged.
	 *
	 * @param oTable The table to be scrolled
	 * @param sRowPath The path identifying the row to scroll to
	 */
	scrollTableToRow: function (oTable: any, sRowPath: string) {
		const oTableRowBinding = oTable.getRowBinding();

		const getTableContexts = function () {
			if (oTable.data().tableType === "GridTable") {
				return oTableRowBinding.getContexts(0);
			} else {
				return oTableRowBinding.getCurrentContexts();
			}
		};

		const findAndScroll = function () {
			const oTableRow = getTableContexts().find(function (item: any) {
				return item && item.getPath() === sRowPath;
			});
			if (oTableRow) {
				oTable.scrollToIndex(oTableRow.getIndex());
			}
		};

		if (oTableRowBinding) {
			const oTableRowBindingContexts = getTableContexts();

			if (
				(oTableRowBindingContexts.length === 0 && oTableRowBinding.getLength() > 0) ||
				oTableRowBindingContexts.some(function (context: any) {
					return context === undefined;
				})
			) {
				// The contexts are not loaded yet --> wait for a change event before scrolling
				oTableRowBinding.attachEventOnce("dataReceived", findAndScroll);
			} else {
				// Contexts are already loaded --> we can try to scroll immediately
				findAndScroll();
			}
		}
	}
};

export default TableScroller;
