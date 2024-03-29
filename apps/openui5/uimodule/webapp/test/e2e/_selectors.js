module.exports = {
    popoverButton: {
        selector: {
            controlType: "sap.m.OverflowToolbarButton",
            properties: {
                text: "My products",
            },
        },
    },
    listSelector: {
        selector: {
            id: "container-com.apress.openui5---BeerList--beerList",
        },
    },
    nameInput: {
        selector: {
            id: "container-com.apress.openui5---BeerAdd--name",
        },
    },
    breweryInput: {
        selector: {
            id: "container-com.apress.openui5---BeerAdd--brewery",
        },
    },
    ibuInput: {
        selector: {
            id: "container-com.apress.openui5---BeerAdd--ibu",
        },
    },
    abvInput: {
        selector: {
            id: "container-com.apress.openui5---BeerAdd--abv",
        },
    },
    logoInput: {
        selector: {
            controlType: "sap.m.Input",
            viewName: "com.apress.openui5.view.BeerAdd",
            viewId: "container-com.apress.openui5---BeerAdd",
            labelFor: {
                text: "Logo",
            },
        },
    },
    saveButton: {
        selector: {
            id: "container-com.apress.openui5---BeerAdd--save",
        },
    },
};
