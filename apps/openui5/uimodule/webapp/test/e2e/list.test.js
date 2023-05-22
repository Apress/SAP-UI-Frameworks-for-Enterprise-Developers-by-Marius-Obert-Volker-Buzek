/* global browser */

const { listSelector, popoverButton } = require("./_selectors");

describe("read scenario", () => {
    it("should find the list of all beers", async () => {
        // locates and presses the product switcher button
        // to open the overlay dialog
        await browser.asControl(popoverButton).press();

        // locates and presses "Show All Beers"
        await browser
            .asControl({
                selector: {
                    controlType: "sap.f.ProductSwitchItem",
                    viewName: "com.apress.openui5.view.MainView",
                    viewId: "container-com.apress.openui5---MainView",
                    i18NText: {
                        propertyName: "title",
                        key: "ShowAllBeers",
                    },
                    searchOpenDialogs: true,
                },
            })
            .press();

        const listItems = await browser.asControl(listSelector).getItems(true); //> `true` retrieves wdio elements only instead of wdi5 controls
        expect(listItems.length).toBeGreaterThanOrEqual(10);
    });

    it("should find the 'Blue Moon' as the first beer", async () => {
        const firstListItem = await browser.asControl(listSelector).getItems(0);
        const firstListItemTitle = await firstListItem.getTitle();
        expect(firstListItemTitle).toEqual("Blue Moon Belgian White");
    });
});
