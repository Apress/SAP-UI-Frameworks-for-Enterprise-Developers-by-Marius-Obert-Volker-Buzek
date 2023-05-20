sap.ui.define(["com/apress/openui5/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterType",
    "sap/ui/model/FilterOperator"],
    function (Controller, Filter, FilterType, FilterOperator) {
        "use strict";

        return Controller.extend("com.apress.openui5.controller.BeerList", {

            onSearch: function (event) {
                const oList = this.byId("beerList");
                const oBinding = oList.getBinding("items");
                const query = event.getSource().getValue();

                if (query && query.length > 0) {
                    oBinding.filter(new Filter({
                        filters: [
                            new Filter("name", FilterOperator.Contains, query),
                            new Filter("brewery", FilterOperator.Contains, query)
                        ],
                        and: false,
                    }), FilterType.Application);
                } else {
                    oBinding.filter(undefined, FilterType.Application);
                }
            },

        });
    });
