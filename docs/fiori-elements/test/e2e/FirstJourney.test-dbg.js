describe("v4 test lib", async () => {
  let FioriElementsFacade
  
  before(async () => {
    FioriElementsFacade = await browser.fe.initialize({
      onTheBeersList: require("./pages/BeersList"),
      onTheBeersObjectPage: require("./pages/BeersObjectPage"),
      onTheShell: {
        Shell: {}
      }
    })
  })

  it("should navigate to the object page", async () => {
    await FioriElementsFacade.execute((Given, When, Then) => {
      // we explicitly don't need to trigger the data retrieval, e.g. via
      // Given.onTheBeersList.onFilterBar().iExecuteSearch()
      // because our app is configured to auto-load all beers on app start!
      // so we can directly do:
      When.onTheBeersList.onTable().iPressRow(0)
      Then.onTheBeersObjectPage.iSeeThisPage()
    })
  })
})
