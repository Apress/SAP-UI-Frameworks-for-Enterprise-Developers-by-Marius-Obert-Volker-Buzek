import Log from "sap/base/Log";
import Utils from "sap/fe/macros/table/Utils";
import type Event from "sap/ui/base/Event";
import type EventProvider from "sap/ui/base/EventProvider";
import type Control from "sap/ui/core/Control";
import type Chart from "sap/ui/mdc/Chart";
import type FilterBar from "sap/ui/mdc/FilterBar";
import type Table from "sap/ui/mdc/Table";
import type Binding from "sap/ui/model/Binding";

class DataQueryWatcher {
	protected _aBindingRegistrations: { binding: Binding; boundControl?: Control; requestedCount: number; receivedCount: number }[] = [];

	protected _aOtherEventSources: EventProvider[] = [];

	protected _isSearchPending = false;

	protected _isDataReceived?: boolean;

	protected _aMDCTables: Table[] = [];

	protected _aMDCCharts: Chart[] = [];

	public constructor(protected _oEventProvider: EventProvider, protected _fnOnFinished: () => void) {}

	// Accessors
	public isSearchPending() {
		return this._isSearchPending;
	}

	public isDataReceived() {
		return this._isDataReceived;
	}

	public resetDataReceived() {
		this._isDataReceived = undefined;
	}

	/**
	 * Reset the state: unsubscribe to all data events and remove all registered objects.
	 */
	public reset(): void {
		// Remove all remaining callbacks
		this._aBindingRegistrations.forEach((reg) => {
			reg.binding.detachEvent("dataRequested", this.onDataRequested, this);
			reg.binding.detachEvent("dataReceived", this.onDataReceived, this);
		});
		this._aOtherEventSources.forEach((oElement: any) => {
			oElement.detachEvent("search", this.onSearch, this);
			oElement.detachEvent("bindingUpdated", this.register, this);
		});
		this._aBindingRegistrations = [];
		this._aOtherEventSources = [];
		this._aMDCTables = [];
		this._aMDCCharts = [];
		this._isSearchPending = false;
		this._isDataReceived = undefined;
	}

	// //////////////////////////////////////////////////
	// Callback when data is received on a binding.
	protected onDataReceived(oEvent: Event, params: { triggeredBySearch: boolean }): void {
		// Look for the corresponding binding registration
		const binding = oEvent.getSource() as Binding;
		const bindingRegistration = this._aBindingRegistrations.find((reg) => {
			return reg.binding === binding;
		});
		if (!bindingRegistration) {
			Log.error("PageReady - data received on an unregistered binding");
			return;
		}
		switch ((binding as any).getGroupId()) {
			case "$auto.Workers":
				this._oEventProvider.fireEvent("workersBatchReceived");
				break;
			case "$auto.Heroes":
				this._oEventProvider.fireEvent("heroesBatchReceived");
				break;
			default:
		}
		bindingRegistration.receivedCount++;
		if (bindingRegistration.receivedCount < bindingRegistration.requestedCount) {
			// There are other request pending --> resubscribe to wait until they return
			binding.attachEventOnce("dataReceived", { triggeredBySearch: params.triggeredBySearch }, this.onDataReceived, this);
			return;
		}
		// Check if at least one binding has requested data, and all bindings that have requested data have received it
		const bAllDone =
			this._aBindingRegistrations.some((reg) => {
				return reg.requestedCount !== 0;
			}) &&
			this._aBindingRegistrations.every((reg) => {
				return reg.requestedCount === 0 || reg.receivedCount >= reg.requestedCount;
			});
		if (params.triggeredBySearch || bindingRegistration.receivedCount >= bindingRegistration.requestedCount) {
			this._isSearchPending = false;
		}
		if (bAllDone) {
			this._isDataReceived = true;
			this._fnOnFinished();
		}
	}

	// //////////////////////////////////////////////////
	// Callback when data is requested on a binding.
	protected onDataRequested(oEvent: Event, params: { triggeredBySearch: boolean }): void {
		// Look for the corresponding binding registration
		const binding = oEvent.getSource() as Binding;
		const bindingRegistration = this._aBindingRegistrations.find((reg) => {
			return reg.binding === binding;
		});
		if (!bindingRegistration) {
			Log.error("PageReady - data requested on an unregistered binding");
			return;
		}
		bindingRegistration.requestedCount++;
		this._isDataReceived = false;
		if (bindingRegistration.requestedCount - bindingRegistration.receivedCount === 1) {
			// Listen to dataReceived only if there's no other request pending
			// Otherwise the 'dataReceived' handler would be called several times when the first query returns
			// and we wouldn't wait for all queries to be finished
			// (we will resubscribe to the dataReceived event in onDataReceived if necessary)
			binding.attachEventOnce("dataReceived", { triggeredBySearch: params.triggeredBySearch }, this.onDataReceived, this);
		}
	}

	// //////////////////////////////////////////////////
	// Callback when a search is triggered from a filterbar
	protected onSearch(oEvent: Event): void {
		const aMDCTableLinkedToFilterBar = this._aMDCTables.filter((oTable) => {
			return (
				(oEvent.getSource() as any).sId === oTable.getFilter() &&
				oTable.getVisible() &&
				!oTable.getParent()?.getProperty("bindingSuspended")
			);
		});
		const aMDCChartsLinkedToFilterBar = this._aMDCCharts.filter((oChart) => {
			return (oEvent.getSource() as any).sId === oChart.getFilter() && oChart.getVisible();
		});
		if (aMDCTableLinkedToFilterBar.length > 0 || aMDCChartsLinkedToFilterBar.length > 0) {
			this._isSearchPending = true;
		}
		aMDCTableLinkedToFilterBar.forEach((oTable) => {
			this.registerTable(oTable, true);
		});
		aMDCChartsLinkedToFilterBar.forEach(async (oChart: any) => {
			try {
				if (oChart.innerChartBoundPromise) {
					await oChart.innerChartBoundPromise;
				}
				this.registerChart(oChart, true);
			} catch (oError: any) {
				Log.error("Cannot find a inner bound chart", oError);
			}
		});
	}

	// //////////////////////////////////////////////////
	// Register a binding (with an optional table/chart)
	// and attach callbacks on dateRequested/dataReceived events
	public register(_event: Event | null, data: { binding?: Binding; table?: Table; chart?: Chart; triggeredBySearch: boolean }): void {
		const binding: Binding | undefined =
			data.binding ||
			data.table?.getRowBinding() ||
			(data.chart as any)?.getControlDelegate().getInnerChart(data.chart).getBinding("data");
		const boundControl = (data.table || data.chart) as Control | undefined;
		if (!binding) {
			return;
		}
		// Check if the binding is already registered
		let bindingRegistration = this._aBindingRegistrations.find((reg) => {
			return reg.binding === binding;
		});
		if (bindingRegistration) {
			if (boundControl) {
				// The binding was already registerd without boundControl information --> update boundControl
				bindingRegistration.boundControl = boundControl;
			}
			// This binding has already requested data, but we're registering it again (on search) --> attach to dataRequested again
			if (bindingRegistration.requestedCount > 0) {
				binding.detachEvent("dataRequested", this.onDataRequested, this);
				binding.attachEventOnce("dataRequested", { triggeredBySearch: data.triggeredBySearch }, this.onDataRequested, this);
			}
			return;
		}
		if (boundControl) {
			// Check if there's a different binding registered for the bound control
			bindingRegistration = this._aBindingRegistrations.find((reg) => {
				return reg.boundControl === boundControl;
			});
			if (bindingRegistration && bindingRegistration.binding !== binding) {
				// The control had a different binding. This can happen in case of MDC charts who recreated their binding after search
				// The previous binding is destroyed, we can replace it with the new and reset counters
				bindingRegistration.binding = binding;
				bindingRegistration.requestedCount = 0;
				bindingRegistration.receivedCount = 0;
			}
		}
		if (!bindingRegistration) {
			bindingRegistration = {
				binding: binding,
				boundControl: boundControl,
				requestedCount: 0,
				receivedCount: 0
			};
			this._aBindingRegistrations.push(bindingRegistration);
		}
		binding.detachEvent("dataRequested", this.onDataRequested, this);
		binding.attachEventOnce("dataRequested", { triggeredBySearch: data.triggeredBySearch }, this.onDataRequested, this);
	}

	/**
	 * Registers a binding for watching its data events (dataRequested and dataReceived).
	 *
	 * @param binding The binding
	 */
	public registerBinding(binding: Binding) {
		this.register(null, { binding, triggeredBySearch: false });
	}

	/**
	 * Registers an MDCTable for watching the data events on its row binding (dataRequested and dataReceived).
	 *
	 * @param table The table
	 * @param triggeredBySearch True if this registration is triggered by a filterBar search
	 */
	protected registerTable(table: Table, triggeredBySearch = false) {
		if (this._aMDCTables.indexOf(table) < 0) {
			this._aMDCTables.push(table);
		}
		const oRowBinding = table.getRowBinding();
		if (oRowBinding) {
			this.register(null, { table, triggeredBySearch });
		}
		if (this._aOtherEventSources.indexOf(table) === -1) {
			table.attachEvent("bindingUpdated", { table, triggeredBySearch }, this.register, this);
			this._aOtherEventSources.push(table);
		}
	}

	/**
	 * Registers an MDCChart for watching the data events on its inner data binding (dataRequested and dataReceived).
	 *
	 * @param chart The chart
	 * @param triggeredBySearch True if this registration is triggered by a filterBar search
	 */
	protected registerChart(chart: Chart, triggeredBySearch = false) {
		if (this._aMDCCharts.indexOf(chart) < 0) {
			this._aMDCCharts.push(chart);
		}
		const oInnerChart = (chart as any).getControlDelegate().getInnerChart(chart);
		const binding = oInnerChart?.getBinding("data");
		if (binding) {
			this.register(null, { chart, triggeredBySearch });
		}
		if (this._aOtherEventSources.indexOf(chart) === -1) {
			chart.attachEvent("bindingUpdated", { chart, triggeredBySearch }, this.register, this);
			this._aOtherEventSources.push(chart);
		}
	}

	/**
	 * Registers an MDCTable or MDCChart for watching the data events on its inner data binding (dataRequested and dataReceived).
	 *
	 * @param element  The table or chart
	 */
	public async registerTableOrChart(element: Table | Chart): Promise<void> {
		if (!element.isA<Table>("sap.ui.mdc.Table") && !element.isA<Chart>("sap.ui.mdc.Chart")) {
			return;
		}
		try {
			await element.initialized(); // access binding only after table/chart is bound
			if (element.isA<Table>("sap.ui.mdc.Table")) {
				this.registerTable(element);
				//If the autoBindOnInit is enabled, the table will be rebound
				//Then we need to wait for this rebind to occur to ensure the pageReady will also wait for the data to be received
				if (element.getAutoBindOnInit() && element.getDomRef()) {
					await Utils.whenBound(element);
				}
			} else {
				this.registerChart(element);
			}
		} catch (oError: any) {
			Log.error("PageReady - Cannot register a table or a chart", oError);
		}
	}

	/**
	 * Registers an MDCFilterBar for watching its search event.
	 *
	 * @param filterBar The filter bar
	 */
	public registerFilterBar(filterBar: FilterBar) {
		filterBar.attachEvent("search", this.onSearch, this);
		this._aOtherEventSources.push(filterBar);
	}
}
export default DataQueryWatcher;
