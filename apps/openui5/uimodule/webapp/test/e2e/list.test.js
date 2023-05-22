/* global browser */

const { listSelector, popoverButton } = require("./_selectors");

describe("read", () => {
    it("should find the list of all customers", async () => {
        // locates and presses the product switcher button
        // to open the overlay dialog
        await browser.asControl(popoverButton).press();

        // locates and presses "Show All Customers"
        await browser
            .asControl({
                selector: {
                    controlType: "sap.f.ProductSwitchItem",
                    viewName: "com.apress.openui5.view.MainView",
                    viewId: "container-com.apress.openui5---MainView",
                    i18NText: {
                        propertyName: "title",
                        key: "ShowAllCustomers",
                    },
                    searchOpenDialogs: true,
                },
            })
            .press();

        const listItems = await browser.asControl(listSelector).getItems(true); //> `true` retrieves wdio elements only instead of wdi5 controls
        expect(listItems.length).toBeGreaterThanOrEqual(10);
    });

    it("should find Marius as the first customer", async () => {
        const firstListItem = await browser.asControl(listSelector).getItems(0);
        const firstListItemTitle = await firstListItem.getTitle();
        expect(firstListItemTitle).toEqual("Marius Obert");
    });
});
