// @ts-nocheck
/* global browser */

const { listSelector, popoverButton, nameInput, breweryInput, ibuInput, abvInput, logoInput, saveButton } = require("./_selectors");

describe("write scenario", () => {
    before(async () => {
        const button = await browser.asControl(popoverButton);
        // trick 17 to switch the browser to English!
        await button.exec(() => {
            sap.ui.getCore().getConfiguration().setLanguage("en");
        });
        // locates and presses the product switcher button
        // to open the overlay dialog
        await button.press();

        // locates and presses "Add New Customer"
        await browser
            .asControl({
                selector: {
                    controlType: "sap.f.ProductSwitchItem",
                    viewName: "com.apress.openui5.view.MainView",
                    i18NText: {
                        propertyName: "title",
                        key: "AddNewBeer",
                    },
                    searchOpenDialogs: true,
                },
            })
            .press();
    });

    it("should add 'Brombachseer Hell' as a new beer", async () => {
        await browser.asControl(nameInput).enterText("Brombachseer Hell");
        await browser.asControl(breweryInput).enterText("Stadtbrauerei Spalt");
        await browser.asControl(ibuInput).enterText("11.8");
        await browser.asControl(abvInput).enterText("5.0");
        await browser.asControl(logoInput).enterText("https://assets.untappd.com/site/beer_logos/beer-4402954_ab335_sm.jpeg");
        await browser.asControl(saveButton).press();
        await browser.pause(3000); // artificial timeout in implementation
    });

    it("should find 'Brombachseer Hell' as the newly entered beer via the list model data", async () => {
        const list = await browser.asControl(listSelector);
        const jsonModel = await list.getModel("sample");
        const modelData = await jsonModel.getData();
        const findling = modelData.beers.find((beer) => beer.name === "Brombachseer Hell");
        expect(findling).toBeTruthy();
    });
});
