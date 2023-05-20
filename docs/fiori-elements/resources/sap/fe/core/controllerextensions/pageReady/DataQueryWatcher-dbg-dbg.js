/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/macros/table/Utils"], function (Log, Utils) {
  "use strict";

  let DataQueryWatcher = /*#__PURE__*/function () {
    function DataQueryWatcher(_oEventProvider, _fnOnFinished) {
      this._aBindingRegistrations = [];
      this._aOtherEventSources = [];
      this._isSearchPending = false;
      this._aMDCTables = [];
      this._aMDCCharts = [];
      this._oEventProvider = _oEventProvider;
      this._fnOnFinished = _fnOnFinished;
    }

    // Accessors
    var _proto = DataQueryWatcher.prototype;
    _proto.isSearchPending = function isSearchPending() {
      return this._isSearchPending;
    };
    _proto.isDataReceived = function isDataReceived() {
      return this._isDataReceived;
    };
    _proto.resetDataReceived = function resetDataReceived() {
      this._isDataReceived = undefined;
    }

    /**
     * Reset the state: unsubscribe to all data events and remove all registered objects.
     */;
    _proto.reset = function reset() {
      // Remove all remaining callbacks
      this._aBindingRegistrations.forEach(reg => {
        reg.binding.detachEvent("dataRequested", this.onDataRequested, this);
        reg.binding.detachEvent("dataReceived", this.onDataReceived, this);
      });
      this._aOtherEventSources.forEach(oElement => {
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
    ;
    _proto.onDataReceived = function onDataReceived(oEvent, params) {
      // Look for the corresponding binding registration
      const binding = oEvent.getSource();
      const bindingRegistration = this._aBindingRegistrations.find(reg => {
        return reg.binding === binding;
      });
      if (!bindingRegistration) {
        Log.error("PageReady - data received on an unregistered binding");
        return;
      }
      switch (binding.getGroupId()) {
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
        binding.attachEventOnce("dataReceived", {
          triggeredBySearch: params.triggeredBySearch
        }, this.onDataReceived, this);
        return;
      }
      // Check if at least one binding has requested data, and all bindings that have requested data have received it
      const bAllDone = this._aBindingRegistrations.some(reg => {
        return reg.requestedCount !== 0;
      }) && this._aBindingRegistrations.every(reg => {
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
    ;
    _proto.onDataRequested = function onDataRequested(oEvent, params) {
      // Look for the corresponding binding registration
      const binding = oEvent.getSource();
      const bindingRegistration = this._aBindingRegistrations.find(reg => {
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
        binding.attachEventOnce("dataReceived", {
          triggeredBySearch: params.triggeredBySearch
        }, this.onDataReceived, this);
      }
    }

    // //////////////////////////////////////////////////
    // Callback when a search is triggered from a filterbar
    ;
    _proto.onSearch = function onSearch(oEvent) {
      const aMDCTableLinkedToFilterBar = this._aMDCTables.filter(oTable => {
        var _oTable$getParent;
        return oEvent.getSource().sId === oTable.getFilter() && oTable.getVisible() && !((_oTable$getParent = oTable.getParent()) !== null && _oTable$getParent !== void 0 && _oTable$getParent.getProperty("bindingSuspended"));
      });
      const aMDCChartsLinkedToFilterBar = this._aMDCCharts.filter(oChart => {
        return oEvent.getSource().sId === oChart.getFilter() && oChart.getVisible();
      });
      if (aMDCTableLinkedToFilterBar.length > 0 || aMDCChartsLinkedToFilterBar.length > 0) {
        this._isSearchPending = true;
      }
      aMDCTableLinkedToFilterBar.forEach(oTable => {
        this.registerTable(oTable, true);
      });
      aMDCChartsLinkedToFilterBar.forEach(async oChart => {
        try {
          if (oChart.innerChartBoundPromise) {
            await oChart.innerChartBoundPromise;
          }
          this.registerChart(oChart, true);
        } catch (oError) {
          Log.error("Cannot find a inner bound chart", oError);
        }
      });
    }

    // //////////////////////////////////////////////////
    // Register a binding (with an optional table/chart)
    // and attach callbacks on dateRequested/dataReceived events
    ;
    _proto.register = function register(_event, data) {
      var _data$table, _data$chart;
      const binding = data.binding || ((_data$table = data.table) === null || _data$table === void 0 ? void 0 : _data$table.getRowBinding()) || ((_data$chart = data.chart) === null || _data$chart === void 0 ? void 0 : _data$chart.getControlDelegate().getInnerChart(data.chart).getBinding("data"));
      const boundControl = data.table || data.chart;
      if (!binding) {
        return;
      }
      // Check if the binding is already registered
      let bindingRegistration = this._aBindingRegistrations.find(reg => {
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
          binding.attachEventOnce("dataRequested", {
            triggeredBySearch: data.triggeredBySearch
          }, this.onDataRequested, this);
        }
        return;
      }
      if (boundControl) {
        // Check if there's a different binding registered for the bound control
        bindingRegistration = this._aBindingRegistrations.find(reg => {
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
      binding.attachEventOnce("dataRequested", {
        triggeredBySearch: data.triggeredBySearch
      }, this.onDataRequested, this);
    }

    /**
     * Registers a binding for watching its data events (dataRequested and dataReceived).
     *
     * @param binding The binding
     */;
    _proto.registerBinding = function registerBinding(binding) {
      this.register(null, {
        binding,
        triggeredBySearch: false
      });
    }

    /**
     * Registers an MDCTable for watching the data events on its row binding (dataRequested and dataReceived).
     *
     * @param table The table
     * @param triggeredBySearch True if this registration is triggered by a filterBar search
     */;
    _proto.registerTable = function registerTable(table) {
      let triggeredBySearch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (this._aMDCTables.indexOf(table) < 0) {
        this._aMDCTables.push(table);
      }
      const oRowBinding = table.getRowBinding();
      if (oRowBinding) {
        this.register(null, {
          table,
          triggeredBySearch
        });
      }
      if (this._aOtherEventSources.indexOf(table) === -1) {
        table.attachEvent("bindingUpdated", {
          table,
          triggeredBySearch
        }, this.register, this);
        this._aOtherEventSources.push(table);
      }
    }

    /**
     * Registers an MDCChart for watching the data events on its inner data binding (dataRequested and dataReceived).
     *
     * @param chart The chart
     * @param triggeredBySearch True if this registration is triggered by a filterBar search
     */;
    _proto.registerChart = function registerChart(chart) {
      let triggeredBySearch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (this._aMDCCharts.indexOf(chart) < 0) {
        this._aMDCCharts.push(chart);
      }
      const oInnerChart = chart.getControlDelegate().getInnerChart(chart);
      const binding = oInnerChart === null || oInnerChart === void 0 ? void 0 : oInnerChart.getBinding("data");
      if (binding) {
        this.register(null, {
          chart,
          triggeredBySearch
        });
      }
      if (this._aOtherEventSources.indexOf(chart) === -1) {
        chart.attachEvent("bindingUpdated", {
          chart,
          triggeredBySearch
        }, this.register, this);
        this._aOtherEventSources.push(chart);
      }
    }

    /**
     * Registers an MDCTable or MDCChart for watching the data events on its inner data binding (dataRequested and dataReceived).
     *
     * @param element  The table or chart
     */;
    _proto.registerTableOrChart = async function registerTableOrChart(element) {
      if (!element.isA("sap.ui.mdc.Table") && !element.isA("sap.ui.mdc.Chart")) {
        return;
      }
      try {
        await element.initialized(); // access binding only after table/chart is bound
        if (element.isA("sap.ui.mdc.Table")) {
          this.registerTable(element);
          //If the autoBindOnInit is enabled, the table will be rebound
          //Then we need to wait for this rebind to occur to ensure the pageReady will also wait for the data to be received
          if (element.getAutoBindOnInit() && element.getDomRef()) {
            await Utils.whenBound(element);
          }
        } else {
          this.registerChart(element);
        }
      } catch (oError) {
        Log.error("PageReady - Cannot register a table or a chart", oError);
      }
    }

    /**
     * Registers an MDCFilterBar for watching its search event.
     *
     * @param filterBar The filter bar
     */;
    _proto.registerFilterBar = function registerFilterBar(filterBar) {
      filterBar.attachEvent("search", this.onSearch, this);
      this._aOtherEventSources.push(filterBar);
    };
    return DataQueryWatcher;
  }();
  return DataQueryWatcher;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEYXRhUXVlcnlXYXRjaGVyIiwiX29FdmVudFByb3ZpZGVyIiwiX2ZuT25GaW5pc2hlZCIsIl9hQmluZGluZ1JlZ2lzdHJhdGlvbnMiLCJfYU90aGVyRXZlbnRTb3VyY2VzIiwiX2lzU2VhcmNoUGVuZGluZyIsIl9hTURDVGFibGVzIiwiX2FNRENDaGFydHMiLCJpc1NlYXJjaFBlbmRpbmciLCJpc0RhdGFSZWNlaXZlZCIsIl9pc0RhdGFSZWNlaXZlZCIsInJlc2V0RGF0YVJlY2VpdmVkIiwidW5kZWZpbmVkIiwicmVzZXQiLCJmb3JFYWNoIiwicmVnIiwiYmluZGluZyIsImRldGFjaEV2ZW50Iiwib25EYXRhUmVxdWVzdGVkIiwib25EYXRhUmVjZWl2ZWQiLCJvRWxlbWVudCIsIm9uU2VhcmNoIiwicmVnaXN0ZXIiLCJvRXZlbnQiLCJwYXJhbXMiLCJnZXRTb3VyY2UiLCJiaW5kaW5nUmVnaXN0cmF0aW9uIiwiZmluZCIsIkxvZyIsImVycm9yIiwiZ2V0R3JvdXBJZCIsImZpcmVFdmVudCIsInJlY2VpdmVkQ291bnQiLCJyZXF1ZXN0ZWRDb3VudCIsImF0dGFjaEV2ZW50T25jZSIsInRyaWdnZXJlZEJ5U2VhcmNoIiwiYkFsbERvbmUiLCJzb21lIiwiZXZlcnkiLCJhTURDVGFibGVMaW5rZWRUb0ZpbHRlckJhciIsImZpbHRlciIsIm9UYWJsZSIsInNJZCIsImdldEZpbHRlciIsImdldFZpc2libGUiLCJnZXRQYXJlbnQiLCJnZXRQcm9wZXJ0eSIsImFNRENDaGFydHNMaW5rZWRUb0ZpbHRlckJhciIsIm9DaGFydCIsImxlbmd0aCIsInJlZ2lzdGVyVGFibGUiLCJpbm5lckNoYXJ0Qm91bmRQcm9taXNlIiwicmVnaXN0ZXJDaGFydCIsIm9FcnJvciIsIl9ldmVudCIsImRhdGEiLCJ0YWJsZSIsImdldFJvd0JpbmRpbmciLCJjaGFydCIsImdldENvbnRyb2xEZWxlZ2F0ZSIsImdldElubmVyQ2hhcnQiLCJnZXRCaW5kaW5nIiwiYm91bmRDb250cm9sIiwicHVzaCIsInJlZ2lzdGVyQmluZGluZyIsImluZGV4T2YiLCJvUm93QmluZGluZyIsImF0dGFjaEV2ZW50Iiwib0lubmVyQ2hhcnQiLCJyZWdpc3RlclRhYmxlT3JDaGFydCIsImVsZW1lbnQiLCJpc0EiLCJpbml0aWFsaXplZCIsImdldEF1dG9CaW5kT25Jbml0IiwiZ2V0RG9tUmVmIiwiVXRpbHMiLCJ3aGVuQm91bmQiLCJyZWdpc3RlckZpbHRlckJhciIsImZpbHRlckJhciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRGF0YVF1ZXJ5V2F0Y2hlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9VdGlsc1wiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBFdmVudFByb3ZpZGVyIGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFByb3ZpZGVyXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBDaGFydCBmcm9tIFwic2FwL3VpL21kYy9DaGFydFwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9CaW5kaW5nXCI7XG5cbmNsYXNzIERhdGFRdWVyeVdhdGNoZXIge1xuXHRwcm90ZWN0ZWQgX2FCaW5kaW5nUmVnaXN0cmF0aW9uczogeyBiaW5kaW5nOiBCaW5kaW5nOyBib3VuZENvbnRyb2w/OiBDb250cm9sOyByZXF1ZXN0ZWRDb3VudDogbnVtYmVyOyByZWNlaXZlZENvdW50OiBudW1iZXIgfVtdID0gW107XG5cblx0cHJvdGVjdGVkIF9hT3RoZXJFdmVudFNvdXJjZXM6IEV2ZW50UHJvdmlkZXJbXSA9IFtdO1xuXG5cdHByb3RlY3RlZCBfaXNTZWFyY2hQZW5kaW5nID0gZmFsc2U7XG5cblx0cHJvdGVjdGVkIF9pc0RhdGFSZWNlaXZlZD86IGJvb2xlYW47XG5cblx0cHJvdGVjdGVkIF9hTURDVGFibGVzOiBUYWJsZVtdID0gW107XG5cblx0cHJvdGVjdGVkIF9hTURDQ2hhcnRzOiBDaGFydFtdID0gW107XG5cblx0cHVibGljIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfb0V2ZW50UHJvdmlkZXI6IEV2ZW50UHJvdmlkZXIsIHByb3RlY3RlZCBfZm5PbkZpbmlzaGVkOiAoKSA9PiB2b2lkKSB7fVxuXG5cdC8vIEFjY2Vzc29yc1xuXHRwdWJsaWMgaXNTZWFyY2hQZW5kaW5nKCkge1xuXHRcdHJldHVybiB0aGlzLl9pc1NlYXJjaFBlbmRpbmc7XG5cdH1cblxuXHRwdWJsaWMgaXNEYXRhUmVjZWl2ZWQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2lzRGF0YVJlY2VpdmVkO1xuXHR9XG5cblx0cHVibGljIHJlc2V0RGF0YVJlY2VpdmVkKCkge1xuXHRcdHRoaXMuX2lzRGF0YVJlY2VpdmVkID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc2V0IHRoZSBzdGF0ZTogdW5zdWJzY3JpYmUgdG8gYWxsIGRhdGEgZXZlbnRzIGFuZCByZW1vdmUgYWxsIHJlZ2lzdGVyZWQgb2JqZWN0cy5cblx0ICovXG5cdHB1YmxpYyByZXNldCgpOiB2b2lkIHtcblx0XHQvLyBSZW1vdmUgYWxsIHJlbWFpbmluZyBjYWxsYmFja3Ncblx0XHR0aGlzLl9hQmluZGluZ1JlZ2lzdHJhdGlvbnMuZm9yRWFjaCgocmVnKSA9PiB7XG5cdFx0XHRyZWcuYmluZGluZy5kZXRhY2hFdmVudChcImRhdGFSZXF1ZXN0ZWRcIiwgdGhpcy5vbkRhdGFSZXF1ZXN0ZWQsIHRoaXMpO1xuXHRcdFx0cmVnLmJpbmRpbmcuZGV0YWNoRXZlbnQoXCJkYXRhUmVjZWl2ZWRcIiwgdGhpcy5vbkRhdGFSZWNlaXZlZCwgdGhpcyk7XG5cdFx0fSk7XG5cdFx0dGhpcy5fYU90aGVyRXZlbnRTb3VyY2VzLmZvckVhY2goKG9FbGVtZW50OiBhbnkpID0+IHtcblx0XHRcdG9FbGVtZW50LmRldGFjaEV2ZW50KFwic2VhcmNoXCIsIHRoaXMub25TZWFyY2gsIHRoaXMpO1xuXHRcdFx0b0VsZW1lbnQuZGV0YWNoRXZlbnQoXCJiaW5kaW5nVXBkYXRlZFwiLCB0aGlzLnJlZ2lzdGVyLCB0aGlzKTtcblx0XHR9KTtcblx0XHR0aGlzLl9hQmluZGluZ1JlZ2lzdHJhdGlvbnMgPSBbXTtcblx0XHR0aGlzLl9hT3RoZXJFdmVudFNvdXJjZXMgPSBbXTtcblx0XHR0aGlzLl9hTURDVGFibGVzID0gW107XG5cdFx0dGhpcy5fYU1EQ0NoYXJ0cyA9IFtdO1xuXHRcdHRoaXMuX2lzU2VhcmNoUGVuZGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuX2lzRGF0YVJlY2VpdmVkID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0Ly8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0Ly8gQ2FsbGJhY2sgd2hlbiBkYXRhIGlzIHJlY2VpdmVkIG9uIGEgYmluZGluZy5cblx0cHJvdGVjdGVkIG9uRGF0YVJlY2VpdmVkKG9FdmVudDogRXZlbnQsIHBhcmFtczogeyB0cmlnZ2VyZWRCeVNlYXJjaDogYm9vbGVhbiB9KTogdm9pZCB7XG5cdFx0Ly8gTG9vayBmb3IgdGhlIGNvcnJlc3BvbmRpbmcgYmluZGluZyByZWdpc3RyYXRpb25cblx0XHRjb25zdCBiaW5kaW5nID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIEJpbmRpbmc7XG5cdFx0Y29uc3QgYmluZGluZ1JlZ2lzdHJhdGlvbiA9IHRoaXMuX2FCaW5kaW5nUmVnaXN0cmF0aW9ucy5maW5kKChyZWcpID0+IHtcblx0XHRcdHJldHVybiByZWcuYmluZGluZyA9PT0gYmluZGluZztcblx0XHR9KTtcblx0XHRpZiAoIWJpbmRpbmdSZWdpc3RyYXRpb24pIHtcblx0XHRcdExvZy5lcnJvcihcIlBhZ2VSZWFkeSAtIGRhdGEgcmVjZWl2ZWQgb24gYW4gdW5yZWdpc3RlcmVkIGJpbmRpbmdcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHN3aXRjaCAoKGJpbmRpbmcgYXMgYW55KS5nZXRHcm91cElkKCkpIHtcblx0XHRcdGNhc2UgXCIkYXV0by5Xb3JrZXJzXCI6XG5cdFx0XHRcdHRoaXMuX29FdmVudFByb3ZpZGVyLmZpcmVFdmVudChcIndvcmtlcnNCYXRjaFJlY2VpdmVkXCIpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCIkYXV0by5IZXJvZXNcIjpcblx0XHRcdFx0dGhpcy5fb0V2ZW50UHJvdmlkZXIuZmlyZUV2ZW50KFwiaGVyb2VzQmF0Y2hSZWNlaXZlZFwiKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdH1cblx0XHRiaW5kaW5nUmVnaXN0cmF0aW9uLnJlY2VpdmVkQ291bnQrKztcblx0XHRpZiAoYmluZGluZ1JlZ2lzdHJhdGlvbi5yZWNlaXZlZENvdW50IDwgYmluZGluZ1JlZ2lzdHJhdGlvbi5yZXF1ZXN0ZWRDb3VudCkge1xuXHRcdFx0Ly8gVGhlcmUgYXJlIG90aGVyIHJlcXVlc3QgcGVuZGluZyAtLT4gcmVzdWJzY3JpYmUgdG8gd2FpdCB1bnRpbCB0aGV5IHJldHVyblxuXHRcdFx0YmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgeyB0cmlnZ2VyZWRCeVNlYXJjaDogcGFyYW1zLnRyaWdnZXJlZEJ5U2VhcmNoIH0sIHRoaXMub25EYXRhUmVjZWl2ZWQsIHRoaXMpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvLyBDaGVjayBpZiBhdCBsZWFzdCBvbmUgYmluZGluZyBoYXMgcmVxdWVzdGVkIGRhdGEsIGFuZCBhbGwgYmluZGluZ3MgdGhhdCBoYXZlIHJlcXVlc3RlZCBkYXRhIGhhdmUgcmVjZWl2ZWQgaXRcblx0XHRjb25zdCBiQWxsRG9uZSA9XG5cdFx0XHR0aGlzLl9hQmluZGluZ1JlZ2lzdHJhdGlvbnMuc29tZSgocmVnKSA9PiB7XG5cdFx0XHRcdHJldHVybiByZWcucmVxdWVzdGVkQ291bnQgIT09IDA7XG5cdFx0XHR9KSAmJlxuXHRcdFx0dGhpcy5fYUJpbmRpbmdSZWdpc3RyYXRpb25zLmV2ZXJ5KChyZWcpID0+IHtcblx0XHRcdFx0cmV0dXJuIHJlZy5yZXF1ZXN0ZWRDb3VudCA9PT0gMCB8fCByZWcucmVjZWl2ZWRDb3VudCA+PSByZWcucmVxdWVzdGVkQ291bnQ7XG5cdFx0XHR9KTtcblx0XHRpZiAocGFyYW1zLnRyaWdnZXJlZEJ5U2VhcmNoIHx8IGJpbmRpbmdSZWdpc3RyYXRpb24ucmVjZWl2ZWRDb3VudCA+PSBiaW5kaW5nUmVnaXN0cmF0aW9uLnJlcXVlc3RlZENvdW50KSB7XG5cdFx0XHR0aGlzLl9pc1NlYXJjaFBlbmRpbmcgPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKGJBbGxEb25lKSB7XG5cdFx0XHR0aGlzLl9pc0RhdGFSZWNlaXZlZCA9IHRydWU7XG5cdFx0XHR0aGlzLl9mbk9uRmluaXNoZWQoKTtcblx0XHR9XG5cdH1cblxuXHQvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBDYWxsYmFjayB3aGVuIGRhdGEgaXMgcmVxdWVzdGVkIG9uIGEgYmluZGluZy5cblx0cHJvdGVjdGVkIG9uRGF0YVJlcXVlc3RlZChvRXZlbnQ6IEV2ZW50LCBwYXJhbXM6IHsgdHJpZ2dlcmVkQnlTZWFyY2g6IGJvb2xlYW4gfSk6IHZvaWQge1xuXHRcdC8vIExvb2sgZm9yIHRoZSBjb3JyZXNwb25kaW5nIGJpbmRpbmcgcmVnaXN0cmF0aW9uXG5cdFx0Y29uc3QgYmluZGluZyA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBCaW5kaW5nO1xuXHRcdGNvbnN0IGJpbmRpbmdSZWdpc3RyYXRpb24gPSB0aGlzLl9hQmluZGluZ1JlZ2lzdHJhdGlvbnMuZmluZCgocmVnKSA9PiB7XG5cdFx0XHRyZXR1cm4gcmVnLmJpbmRpbmcgPT09IGJpbmRpbmc7XG5cdFx0fSk7XG5cdFx0aWYgKCFiaW5kaW5nUmVnaXN0cmF0aW9uKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJQYWdlUmVhZHkgLSBkYXRhIHJlcXVlc3RlZCBvbiBhbiB1bnJlZ2lzdGVyZWQgYmluZGluZ1wiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0YmluZGluZ1JlZ2lzdHJhdGlvbi5yZXF1ZXN0ZWRDb3VudCsrO1xuXHRcdHRoaXMuX2lzRGF0YVJlY2VpdmVkID0gZmFsc2U7XG5cdFx0aWYgKGJpbmRpbmdSZWdpc3RyYXRpb24ucmVxdWVzdGVkQ291bnQgLSBiaW5kaW5nUmVnaXN0cmF0aW9uLnJlY2VpdmVkQ291bnQgPT09IDEpIHtcblx0XHRcdC8vIExpc3RlbiB0byBkYXRhUmVjZWl2ZWQgb25seSBpZiB0aGVyZSdzIG5vIG90aGVyIHJlcXVlc3QgcGVuZGluZ1xuXHRcdFx0Ly8gT3RoZXJ3aXNlIHRoZSAnZGF0YVJlY2VpdmVkJyBoYW5kbGVyIHdvdWxkIGJlIGNhbGxlZCBzZXZlcmFsIHRpbWVzIHdoZW4gdGhlIGZpcnN0IHF1ZXJ5IHJldHVybnNcblx0XHRcdC8vIGFuZCB3ZSB3b3VsZG4ndCB3YWl0IGZvciBhbGwgcXVlcmllcyB0byBiZSBmaW5pc2hlZFxuXHRcdFx0Ly8gKHdlIHdpbGwgcmVzdWJzY3JpYmUgdG8gdGhlIGRhdGFSZWNlaXZlZCBldmVudCBpbiBvbkRhdGFSZWNlaXZlZCBpZiBuZWNlc3NhcnkpXG5cdFx0XHRiaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZWNlaXZlZFwiLCB7IHRyaWdnZXJlZEJ5U2VhcmNoOiBwYXJhbXMudHJpZ2dlcmVkQnlTZWFyY2ggfSwgdGhpcy5vbkRhdGFSZWNlaXZlZCwgdGhpcyk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0Ly8gQ2FsbGJhY2sgd2hlbiBhIHNlYXJjaCBpcyB0cmlnZ2VyZWQgZnJvbSBhIGZpbHRlcmJhclxuXHRwcm90ZWN0ZWQgb25TZWFyY2gob0V2ZW50OiBFdmVudCk6IHZvaWQge1xuXHRcdGNvbnN0IGFNRENUYWJsZUxpbmtlZFRvRmlsdGVyQmFyID0gdGhpcy5fYU1EQ1RhYmxlcy5maWx0ZXIoKG9UYWJsZSkgPT4ge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0KG9FdmVudC5nZXRTb3VyY2UoKSBhcyBhbnkpLnNJZCA9PT0gb1RhYmxlLmdldEZpbHRlcigpICYmXG5cdFx0XHRcdG9UYWJsZS5nZXRWaXNpYmxlKCkgJiZcblx0XHRcdFx0IW9UYWJsZS5nZXRQYXJlbnQoKT8uZ2V0UHJvcGVydHkoXCJiaW5kaW5nU3VzcGVuZGVkXCIpXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHRcdGNvbnN0IGFNRENDaGFydHNMaW5rZWRUb0ZpbHRlckJhciA9IHRoaXMuX2FNRENDaGFydHMuZmlsdGVyKChvQ2hhcnQpID0+IHtcblx0XHRcdHJldHVybiAob0V2ZW50LmdldFNvdXJjZSgpIGFzIGFueSkuc0lkID09PSBvQ2hhcnQuZ2V0RmlsdGVyKCkgJiYgb0NoYXJ0LmdldFZpc2libGUoKTtcblx0XHR9KTtcblx0XHRpZiAoYU1EQ1RhYmxlTGlua2VkVG9GaWx0ZXJCYXIubGVuZ3RoID4gMCB8fCBhTURDQ2hhcnRzTGlua2VkVG9GaWx0ZXJCYXIubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5faXNTZWFyY2hQZW5kaW5nID0gdHJ1ZTtcblx0XHR9XG5cdFx0YU1EQ1RhYmxlTGlua2VkVG9GaWx0ZXJCYXIuZm9yRWFjaCgob1RhYmxlKSA9PiB7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyVGFibGUob1RhYmxlLCB0cnVlKTtcblx0XHR9KTtcblx0XHRhTURDQ2hhcnRzTGlua2VkVG9GaWx0ZXJCYXIuZm9yRWFjaChhc3luYyAob0NoYXJ0OiBhbnkpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChvQ2hhcnQuaW5uZXJDaGFydEJvdW5kUHJvbWlzZSkge1xuXHRcdFx0XHRcdGF3YWl0IG9DaGFydC5pbm5lckNoYXJ0Qm91bmRQcm9taXNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJDaGFydChvQ2hhcnQsIHRydWUpO1xuXHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IGZpbmQgYSBpbm5lciBib3VuZCBjaGFydFwiLCBvRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0Ly8gUmVnaXN0ZXIgYSBiaW5kaW5nICh3aXRoIGFuIG9wdGlvbmFsIHRhYmxlL2NoYXJ0KVxuXHQvLyBhbmQgYXR0YWNoIGNhbGxiYWNrcyBvbiBkYXRlUmVxdWVzdGVkL2RhdGFSZWNlaXZlZCBldmVudHNcblx0cHVibGljIHJlZ2lzdGVyKF9ldmVudDogRXZlbnQgfCBudWxsLCBkYXRhOiB7IGJpbmRpbmc/OiBCaW5kaW5nOyB0YWJsZT86IFRhYmxlOyBjaGFydD86IENoYXJ0OyB0cmlnZ2VyZWRCeVNlYXJjaDogYm9vbGVhbiB9KTogdm9pZCB7XG5cdFx0Y29uc3QgYmluZGluZzogQmluZGluZyB8IHVuZGVmaW5lZCA9XG5cdFx0XHRkYXRhLmJpbmRpbmcgfHxcblx0XHRcdGRhdGEudGFibGU/LmdldFJvd0JpbmRpbmcoKSB8fFxuXHRcdFx0KGRhdGEuY2hhcnQgYXMgYW55KT8uZ2V0Q29udHJvbERlbGVnYXRlKCkuZ2V0SW5uZXJDaGFydChkYXRhLmNoYXJ0KS5nZXRCaW5kaW5nKFwiZGF0YVwiKTtcblx0XHRjb25zdCBib3VuZENvbnRyb2wgPSAoZGF0YS50YWJsZSB8fCBkYXRhLmNoYXJ0KSBhcyBDb250cm9sIHwgdW5kZWZpbmVkO1xuXHRcdGlmICghYmluZGluZykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvLyBDaGVjayBpZiB0aGUgYmluZGluZyBpcyBhbHJlYWR5IHJlZ2lzdGVyZWRcblx0XHRsZXQgYmluZGluZ1JlZ2lzdHJhdGlvbiA9IHRoaXMuX2FCaW5kaW5nUmVnaXN0cmF0aW9ucy5maW5kKChyZWcpID0+IHtcblx0XHRcdHJldHVybiByZWcuYmluZGluZyA9PT0gYmluZGluZztcblx0XHR9KTtcblx0XHRpZiAoYmluZGluZ1JlZ2lzdHJhdGlvbikge1xuXHRcdFx0aWYgKGJvdW5kQ29udHJvbCkge1xuXHRcdFx0XHQvLyBUaGUgYmluZGluZyB3YXMgYWxyZWFkeSByZWdpc3RlcmQgd2l0aG91dCBib3VuZENvbnRyb2wgaW5mb3JtYXRpb24gLS0+IHVwZGF0ZSBib3VuZENvbnRyb2xcblx0XHRcdFx0YmluZGluZ1JlZ2lzdHJhdGlvbi5ib3VuZENvbnRyb2wgPSBib3VuZENvbnRyb2w7XG5cdFx0XHR9XG5cdFx0XHQvLyBUaGlzIGJpbmRpbmcgaGFzIGFscmVhZHkgcmVxdWVzdGVkIGRhdGEsIGJ1dCB3ZSdyZSByZWdpc3RlcmluZyBpdCBhZ2FpbiAob24gc2VhcmNoKSAtLT4gYXR0YWNoIHRvIGRhdGFSZXF1ZXN0ZWQgYWdhaW5cblx0XHRcdGlmIChiaW5kaW5nUmVnaXN0cmF0aW9uLnJlcXVlc3RlZENvdW50ID4gMCkge1xuXHRcdFx0XHRiaW5kaW5nLmRldGFjaEV2ZW50KFwiZGF0YVJlcXVlc3RlZFwiLCB0aGlzLm9uRGF0YVJlcXVlc3RlZCwgdGhpcyk7XG5cdFx0XHRcdGJpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiZGF0YVJlcXVlc3RlZFwiLCB7IHRyaWdnZXJlZEJ5U2VhcmNoOiBkYXRhLnRyaWdnZXJlZEJ5U2VhcmNoIH0sIHRoaXMub25EYXRhUmVxdWVzdGVkLCB0aGlzKTtcblx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKGJvdW5kQ29udHJvbCkge1xuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhlcmUncyBhIGRpZmZlcmVudCBiaW5kaW5nIHJlZ2lzdGVyZWQgZm9yIHRoZSBib3VuZCBjb250cm9sXG5cdFx0XHRiaW5kaW5nUmVnaXN0cmF0aW9uID0gdGhpcy5fYUJpbmRpbmdSZWdpc3RyYXRpb25zLmZpbmQoKHJlZykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcmVnLmJvdW5kQ29udHJvbCA9PT0gYm91bmRDb250cm9sO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoYmluZGluZ1JlZ2lzdHJhdGlvbiAmJiBiaW5kaW5nUmVnaXN0cmF0aW9uLmJpbmRpbmcgIT09IGJpbmRpbmcpIHtcblx0XHRcdFx0Ly8gVGhlIGNvbnRyb2wgaGFkIGEgZGlmZmVyZW50IGJpbmRpbmcuIFRoaXMgY2FuIGhhcHBlbiBpbiBjYXNlIG9mIE1EQyBjaGFydHMgd2hvIHJlY3JlYXRlZCB0aGVpciBiaW5kaW5nIGFmdGVyIHNlYXJjaFxuXHRcdFx0XHQvLyBUaGUgcHJldmlvdXMgYmluZGluZyBpcyBkZXN0cm95ZWQsIHdlIGNhbiByZXBsYWNlIGl0IHdpdGggdGhlIG5ldyBhbmQgcmVzZXQgY291bnRlcnNcblx0XHRcdFx0YmluZGluZ1JlZ2lzdHJhdGlvbi5iaW5kaW5nID0gYmluZGluZztcblx0XHRcdFx0YmluZGluZ1JlZ2lzdHJhdGlvbi5yZXF1ZXN0ZWRDb3VudCA9IDA7XG5cdFx0XHRcdGJpbmRpbmdSZWdpc3RyYXRpb24ucmVjZWl2ZWRDb3VudCA9IDA7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghYmluZGluZ1JlZ2lzdHJhdGlvbikge1xuXHRcdFx0YmluZGluZ1JlZ2lzdHJhdGlvbiA9IHtcblx0XHRcdFx0YmluZGluZzogYmluZGluZyxcblx0XHRcdFx0Ym91bmRDb250cm9sOiBib3VuZENvbnRyb2wsXG5cdFx0XHRcdHJlcXVlc3RlZENvdW50OiAwLFxuXHRcdFx0XHRyZWNlaXZlZENvdW50OiAwXG5cdFx0XHR9O1xuXHRcdFx0dGhpcy5fYUJpbmRpbmdSZWdpc3RyYXRpb25zLnB1c2goYmluZGluZ1JlZ2lzdHJhdGlvbik7XG5cdFx0fVxuXHRcdGJpbmRpbmcuZGV0YWNoRXZlbnQoXCJkYXRhUmVxdWVzdGVkXCIsIHRoaXMub25EYXRhUmVxdWVzdGVkLCB0aGlzKTtcblx0XHRiaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZXF1ZXN0ZWRcIiwgeyB0cmlnZ2VyZWRCeVNlYXJjaDogZGF0YS50cmlnZ2VyZWRCeVNlYXJjaCB9LCB0aGlzLm9uRGF0YVJlcXVlc3RlZCwgdGhpcyk7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgYmluZGluZyBmb3Igd2F0Y2hpbmcgaXRzIGRhdGEgZXZlbnRzIChkYXRhUmVxdWVzdGVkIGFuZCBkYXRhUmVjZWl2ZWQpLlxuXHQgKlxuXHQgKiBAcGFyYW0gYmluZGluZyBUaGUgYmluZGluZ1xuXHQgKi9cblx0cHVibGljIHJlZ2lzdGVyQmluZGluZyhiaW5kaW5nOiBCaW5kaW5nKSB7XG5cdFx0dGhpcy5yZWdpc3RlcihudWxsLCB7IGJpbmRpbmcsIHRyaWdnZXJlZEJ5U2VhcmNoOiBmYWxzZSB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYW4gTURDVGFibGUgZm9yIHdhdGNoaW5nIHRoZSBkYXRhIGV2ZW50cyBvbiBpdHMgcm93IGJpbmRpbmcgKGRhdGFSZXF1ZXN0ZWQgYW5kIGRhdGFSZWNlaXZlZCkuXG5cdCAqXG5cdCAqIEBwYXJhbSB0YWJsZSBUaGUgdGFibGVcblx0ICogQHBhcmFtIHRyaWdnZXJlZEJ5U2VhcmNoIFRydWUgaWYgdGhpcyByZWdpc3RyYXRpb24gaXMgdHJpZ2dlcmVkIGJ5IGEgZmlsdGVyQmFyIHNlYXJjaFxuXHQgKi9cblx0cHJvdGVjdGVkIHJlZ2lzdGVyVGFibGUodGFibGU6IFRhYmxlLCB0cmlnZ2VyZWRCeVNlYXJjaCA9IGZhbHNlKSB7XG5cdFx0aWYgKHRoaXMuX2FNRENUYWJsZXMuaW5kZXhPZih0YWJsZSkgPCAwKSB7XG5cdFx0XHR0aGlzLl9hTURDVGFibGVzLnB1c2godGFibGUpO1xuXHRcdH1cblx0XHRjb25zdCBvUm93QmluZGluZyA9IHRhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRpZiAob1Jvd0JpbmRpbmcpIHtcblx0XHRcdHRoaXMucmVnaXN0ZXIobnVsbCwgeyB0YWJsZSwgdHJpZ2dlcmVkQnlTZWFyY2ggfSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLl9hT3RoZXJFdmVudFNvdXJjZXMuaW5kZXhPZih0YWJsZSkgPT09IC0xKSB7XG5cdFx0XHR0YWJsZS5hdHRhY2hFdmVudChcImJpbmRpbmdVcGRhdGVkXCIsIHsgdGFibGUsIHRyaWdnZXJlZEJ5U2VhcmNoIH0sIHRoaXMucmVnaXN0ZXIsIHRoaXMpO1xuXHRcdFx0dGhpcy5fYU90aGVyRXZlbnRTb3VyY2VzLnB1c2godGFibGUpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYW4gTURDQ2hhcnQgZm9yIHdhdGNoaW5nIHRoZSBkYXRhIGV2ZW50cyBvbiBpdHMgaW5uZXIgZGF0YSBiaW5kaW5nIChkYXRhUmVxdWVzdGVkIGFuZCBkYXRhUmVjZWl2ZWQpLlxuXHQgKlxuXHQgKiBAcGFyYW0gY2hhcnQgVGhlIGNoYXJ0XG5cdCAqIEBwYXJhbSB0cmlnZ2VyZWRCeVNlYXJjaCBUcnVlIGlmIHRoaXMgcmVnaXN0cmF0aW9uIGlzIHRyaWdnZXJlZCBieSBhIGZpbHRlckJhciBzZWFyY2hcblx0ICovXG5cdHByb3RlY3RlZCByZWdpc3RlckNoYXJ0KGNoYXJ0OiBDaGFydCwgdHJpZ2dlcmVkQnlTZWFyY2ggPSBmYWxzZSkge1xuXHRcdGlmICh0aGlzLl9hTURDQ2hhcnRzLmluZGV4T2YoY2hhcnQpIDwgMCkge1xuXHRcdFx0dGhpcy5fYU1EQ0NoYXJ0cy5wdXNoKGNoYXJ0KTtcblx0XHR9XG5cdFx0Y29uc3Qgb0lubmVyQ2hhcnQgPSAoY2hhcnQgYXMgYW55KS5nZXRDb250cm9sRGVsZWdhdGUoKS5nZXRJbm5lckNoYXJ0KGNoYXJ0KTtcblx0XHRjb25zdCBiaW5kaW5nID0gb0lubmVyQ2hhcnQ/LmdldEJpbmRpbmcoXCJkYXRhXCIpO1xuXHRcdGlmIChiaW5kaW5nKSB7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyKG51bGwsIHsgY2hhcnQsIHRyaWdnZXJlZEJ5U2VhcmNoIH0pO1xuXHRcdH1cblx0XHRpZiAodGhpcy5fYU90aGVyRXZlbnRTb3VyY2VzLmluZGV4T2YoY2hhcnQpID09PSAtMSkge1xuXHRcdFx0Y2hhcnQuYXR0YWNoRXZlbnQoXCJiaW5kaW5nVXBkYXRlZFwiLCB7IGNoYXJ0LCB0cmlnZ2VyZWRCeVNlYXJjaCB9LCB0aGlzLnJlZ2lzdGVyLCB0aGlzKTtcblx0XHRcdHRoaXMuX2FPdGhlckV2ZW50U291cmNlcy5wdXNoKGNoYXJ0KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGFuIE1EQ1RhYmxlIG9yIE1EQ0NoYXJ0IGZvciB3YXRjaGluZyB0aGUgZGF0YSBldmVudHMgb24gaXRzIGlubmVyIGRhdGEgYmluZGluZyAoZGF0YVJlcXVlc3RlZCBhbmQgZGF0YVJlY2VpdmVkKS5cblx0ICpcblx0ICogQHBhcmFtIGVsZW1lbnQgIFRoZSB0YWJsZSBvciBjaGFydFxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJlZ2lzdGVyVGFibGVPckNoYXJ0KGVsZW1lbnQ6IFRhYmxlIHwgQ2hhcnQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoIWVsZW1lbnQuaXNBPFRhYmxlPihcInNhcC51aS5tZGMuVGFibGVcIikgJiYgIWVsZW1lbnQuaXNBPENoYXJ0PihcInNhcC51aS5tZGMuQ2hhcnRcIikpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IGVsZW1lbnQuaW5pdGlhbGl6ZWQoKTsgLy8gYWNjZXNzIGJpbmRpbmcgb25seSBhZnRlciB0YWJsZS9jaGFydCBpcyBib3VuZFxuXHRcdFx0aWYgKGVsZW1lbnQuaXNBPFRhYmxlPihcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0dGhpcy5yZWdpc3RlclRhYmxlKGVsZW1lbnQpO1xuXHRcdFx0XHQvL0lmIHRoZSBhdXRvQmluZE9uSW5pdCBpcyBlbmFibGVkLCB0aGUgdGFibGUgd2lsbCBiZSByZWJvdW5kXG5cdFx0XHRcdC8vVGhlbiB3ZSBuZWVkIHRvIHdhaXQgZm9yIHRoaXMgcmViaW5kIHRvIG9jY3VyIHRvIGVuc3VyZSB0aGUgcGFnZVJlYWR5IHdpbGwgYWxzbyB3YWl0IGZvciB0aGUgZGF0YSB0byBiZSByZWNlaXZlZFxuXHRcdFx0XHRpZiAoZWxlbWVudC5nZXRBdXRvQmluZE9uSW5pdCgpICYmIGVsZW1lbnQuZ2V0RG9tUmVmKCkpIHtcblx0XHRcdFx0XHRhd2FpdCBVdGlscy53aGVuQm91bmQoZWxlbWVudCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJDaGFydChlbGVtZW50KTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiUGFnZVJlYWR5IC0gQ2Fubm90IHJlZ2lzdGVyIGEgdGFibGUgb3IgYSBjaGFydFwiLCBvRXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYW4gTURDRmlsdGVyQmFyIGZvciB3YXRjaGluZyBpdHMgc2VhcmNoIGV2ZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlsdGVyQmFyIFRoZSBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRwdWJsaWMgcmVnaXN0ZXJGaWx0ZXJCYXIoZmlsdGVyQmFyOiBGaWx0ZXJCYXIpIHtcblx0XHRmaWx0ZXJCYXIuYXR0YWNoRXZlbnQoXCJzZWFyY2hcIiwgdGhpcy5vblNlYXJjaCwgdGhpcyk7XG5cdFx0dGhpcy5fYU90aGVyRXZlbnRTb3VyY2VzLnB1c2goZmlsdGVyQmFyKTtcblx0fVxufVxuZXhwb3J0IGRlZmF1bHQgRGF0YVF1ZXJ5V2F0Y2hlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztNQVVNQSxnQkFBZ0I7SUFhckIsMEJBQTZCQyxlQUE4QixFQUFZQyxhQUF5QixFQUFFO01BQUEsS0FaeEZDLHNCQUFzQixHQUFrRyxFQUFFO01BQUEsS0FFMUhDLG1CQUFtQixHQUFvQixFQUFFO01BQUEsS0FFekNDLGdCQUFn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