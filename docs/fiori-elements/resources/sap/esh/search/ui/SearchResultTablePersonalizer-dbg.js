/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./i18n", "sap/m/TablePersoController", "./SearchResultTableColumnType", "./error/errors"], function (__i18n, TablePersoController, ___SearchResultTableColumnType, ___error_errors) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  var i18n = _interopRequireDefault(__i18n);
  var TableColumnType = ___SearchResultTableColumnType["TableColumnType"];
  var ProgramError = ___error_errors["ProgramError"];
  var SearchResultTablePersonalizer = /*#__PURE__*/function () {
    // used in persoColumnIdPrefix and new TablePersoController
    // personalization storage column id prefix
    // personalization storage id

    function SearchResultTablePersonalizer(searchModel) {
      _classCallCheck(this, SearchResultTablePersonalizer);
      // properties constitant after init:
      this.model = searchModel;
      this.componentName = this.model.config.isUshell ? "sap.ushell.renderers.fiori2.search.container" : "entprise-search";
      this.persoColumnIdPrefix = this.componentName + "-table-"; // sap.m.TablePersoController defined format, NOT to change

      // properties NOT consistant after init:
      this.storageId = undefined; // updated in update() when onAllSearchFinished
    }

    // TODO: rename update
    _createClass(SearchResultTablePersonalizer, [{
      key: "update",
      value: function update(searchResultTable) {
        // if (
        //     !this.model?.getDataSource()?.id ||
        //     !this.model?.getPersonalizationStorageInstance()?.getItem ||
        //     !this.model?.getPersonalizationStorageInstance()?.setItem ||
        //     !this.model?.getPersonalizationStorageInstance()?.getPersonalizer ||
        //     !this.componentName ||
        //     !this.persoColumnIdPrefix
        // ) {
        //     throw new errors.ProgramError(null, i18n.getText("error.updatePersonalizationState"));
        // }

        try {
          if (!searchResultTable || this.model.getProperty("/tableRows").length === 0) {
            // do nothing when no table nor result
            return;
          }
          this.table = searchResultTable;
          this.storageId = "search-result-table-state-" + this.model.getDataSource().id;
          this.updateInitialPersonalizationState();
          this.updateActivePersonalizationState();
          this.updatePersoController();
        } catch (error) {
          throw new ProgramError(error, i18n.getText("error.updatePersonalizationState"));
        }
      }
    }, {
      key: "updateInitialPersonalizationState",
      value: function updateInitialPersonalizationState() {
        var newPersonalizationState = this.createInitialPersonalizationState();
        this.model.getPersonalizationStorageInstance().setItem(this.storageId + "INITIAL", newPersonalizationState);
      }
    }, {
      key: "createInitialPersonalizationState",
      value: function createInitialPersonalizationState() {
        var modelColumns = this.model.getProperty("/tableColumns");
        var columns = [];
        var prefix = this.persoColumnIdPrefix;
        if (this.model.config.extendTableColumn) {
          modelColumns.forEach(function (column) {
            columns.push({
              id: prefix + column.persoColumnId,
              text: column.name,
              order: column.index,
              visible: column.index < 7 || column.type === TableColumnType.EXTEND,
              group: null
            });
          });
        } else {
          modelColumns.forEach(function (column) {
            columns.push({
              id: prefix + column.persoColumnId,
              text: column.name,
              order: column.index,
              visible: column.index < 6,
              group: null
            });
          });
        }
        return {
          aColumns: columns,
          _persoSchemaVersion: "1.0" // UI5 defined
        };
      }
    }, {
      key: "updateActivePersonalizationState",
      value: function updateActivePersonalizationState() {
        var initialPersonalizationState = this.model.getPersonalizationStorageInstance().getItem(this.storageId + "INITIAL");
        var activePersonalizationState = this.model.getPersonalizationStorageInstance().getItem(this.storageId);
        if (!this.isValid(activePersonalizationState)) {
          this.model.getPersonalizationStorageInstance().setItem(this.storageId, initialPersonalizationState);
        } else {
          this.model.getPersonalizationStorageInstance().setItem(this.storageId, this.adaptActivePersonalizationState(activePersonalizationState, initialPersonalizationState) // TODO: rename personalizationState, ...
          );
        }
      }
    }, {
      key: "adaptActivePersonalizationState",
      value: function adaptActivePersonalizationState(activePersonalizationState, initialPersonalizationState) {
        var expiredColumns = activePersonalizationState === null || activePersonalizationState === void 0 ? void 0 : activePersonalizationState.aColumns; // expired active state columns
        var baseColumns = initialPersonalizationState === null || initialPersonalizationState === void 0 ? void 0 : initialPersonalizationState.aColumns; // initial state columns, base of new active state
        var headColumns = []; // new active state columns, head part
        var tailColumns = []; // new active state columns, tail part
        var finalColumns = []; // new active state columns, head part concat tail part

        for (var i = 0; i < baseColumns.length; i++) {
          var column = this.getPersonalizationColumn(expiredColumns, baseColumns[i].id.substring(this.persoColumnIdPrefix.length) // cut prefix, get persoColumnId
          );

          if (column) {
            // initial perso column found in expired active columns
            headColumns.push({
              id: column.id,
              text: column.text,
              order: column.order,
              visible: column.visible,
              group: column.group
            });
          } else {
            // initial perso column NOT found in expired active columns
            tailColumns.push({
              id: baseColumns[i].id,
              text: baseColumns[i].text,
              order: -1,
              visible: false,
              group: baseColumns[i].group
            });
          }
        }

        // ascending sort perso columns
        headColumns.sort(this.orderPersonalizationColumns);
        // concat head and tail array
        finalColumns = headColumns.concat(tailColumns);
        // assign order value, avoid gap of order
        for (var _i = 0; _i < finalColumns.length; _i++) {
          finalColumns[_i].order = _i;
        }
        return {
          aColumns: finalColumns,
          _persoSchemaVersion: "1.0" // UI5 defined
        };
      }
    }, {
      key: "updatePersoController",
      value: function updatePersoController() {
        if (!this.table) {
          return;
        }
        try {
          var _this$persoController, _this$persoController2, _this$persoController3;
          // if (
          // !this.persoController ||
          // (this.persoController.getPersoService() as Personalizer)?.getKey() !== this.storageId // persoService and search model have different datasource id.
          // ) {
          // persoController.setPersoService NOT functional
          // reason: setPersoService doesn't get updated initial personalization state!
          // use case:
          // 1. search "*" -> initial and active personalization state of storage don't have whyfund column
          // 2. search "table" -> initial and active personalization state of storage have new whyfund column
          // 3. run persoController.setPersoService:
          //   this.persoController.destroyPersoService();
          //   this.persoController.setPersoService(
          //       this.model.getPersonalizationStorageInstance().getPersonalizer(this.storageId)
          //   );
          //   this.persoController.refresh();
          // 4. active personalization state of persoController is updated (with whyfound), but initial personalization state not (without whyfound).
          // 5. open personalization dialog. dialog has whyfound column.
          // 6. click reset, table is personalized by old initial personalization state (without whyfound)
          // 7. open personalization dialog. dialog doesn't have whyfound column.
          // solution: destroy and create persoController instead of setPersoService
          (_this$persoController = this.persoController) === null || _this$persoController === void 0 ? void 0 : (_this$persoController2 = _this$persoController.getTablePersoDialog()) === null || _this$persoController2 === void 0 ? void 0 : _this$persoController2.destroy();
          (_this$persoController3 = this.persoController) === null || _this$persoController3 === void 0 ? void 0 : _this$persoController3.destroy();
          this.persoController = new TablePersoController("", {
            table: this.table,
            persoService: this.model.getPersonalizationStorageInstance().getPersonalizer(this.storageId),
            componentName: this.componentName,
            resetAllMode: sap.m.ResetAllMode.ServiceReset
          });
          this.persoController.activate();
          // }
        } catch (error) {
          throw new ProgramError(error, i18n.getText("error.updatePersoController"));
        }
      }
    }, {
      key: "openDialog",
      value: function openDialog() {
        var _this$persoController4;
        (_this$persoController4 = this.persoController) === null || _this$persoController4 === void 0 ? void 0 : _this$persoController4.openDialog();
      }
    }, {
      key: "destroyControllerAndDialog",
      value: function destroyControllerAndDialog() {
        var _this$persoController5, _this$persoController6, _this$persoController7;
        (_this$persoController5 = this.persoController) === null || _this$persoController5 === void 0 ? void 0 : (_this$persoController6 = _this$persoController5.getTablePersoDialog()) === null || _this$persoController6 === void 0 ? void 0 : _this$persoController6.destroy();
        (_this$persoController7 = this.persoController) === null || _this$persoController7 === void 0 ? void 0 : _this$persoController7.destroy();
      }
    }, {
      key: "isValid",
      value: function isValid(persoState) {
        if (!persoState || !Array.isArray(persoState.aColumns) || persoState._persoSchemaVersion !== "1.0" // UI5 defined
        ) {
          return false;
        }
        return true;
      }

      // private isEqual(persoState1: PersonalizationState, persoState2: PersonalizationState): boolean {
      //     if (!this.isValid(persoState1) || !this.isValid(persoState2)) {
      //         return false;
      //     }

      //     const persoColumns1 = persoState1.aColumns;
      //     const persoColumns2 = persoState2.aColumns;

      //     if (persoColumns1.length !== persoColumns2.length) {
      //         return false;
      //     }

      //     for (let i = 0; i < persoColumns1.length; i++) {
      //         const attributeId = persoColumns1[i].id.substring(this.persoColumnIdPrefix.length);
      //         const column = this.getPersonalizationColumn(persoColumns2, attributeId);
      //         if (
      //             column === undefined ||
      //             column.text !== persoColumns1[i].text ||
      //             column.order !== persoColumns1[i].order ||
      //             column.visible !== persoColumns1[i].visible ||
      //             column.group !== persoColumns1[i].group
      //         ) {
      //             return false;
      //         }
      //     }

      //     return true;
      // }
    }, {
      key: "getPersonalizationColumn",
      value: function getPersonalizationColumn(persoColumns, persoColumnId) {
        if (Array.isArray(persoColumns) === false || persoColumns.length === 0) {
          return undefined;
        }
        for (var i = 0; i < persoColumns.length; i++) {
          if (persoColumns[i].id === this.persoColumnIdPrefix + persoColumnId) {
            return persoColumns[i];
          }
        }
        return undefined;
      }
    }, {
      key: "orderPersonalizationColumns",
      value: function orderPersonalizationColumns(columnA, columnB) {
        if (columnA.order < columnB.order) {
          return -1;
        }
        if (columnA.order > columnB.order) {
          return 1;
        }
        return 0;
      }
    }]);
    return SearchResultTablePersonalizer;
  }();
  return SearchResultTablePersonalizer;
});
})();