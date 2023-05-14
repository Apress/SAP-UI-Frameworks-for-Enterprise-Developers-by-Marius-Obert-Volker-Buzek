export function bindBeerItems(parent, list) {
  const items = list.reduce((markup, item) => {
    return (
      markup +
      `<ui5-li icon="business-suite/bottle" description="IBU: ${item.ibu} ABV ${
        item.abv
      }"  additional-text="
          ${
            item.ibu > 25 ? "Very bitter" : item.ibu > 10 ? "Bitter" : ""
          }" additional-text-state="${
        item.ibu > 25 ? "Error" : item.ibu > 10 ? "Warning" : ""
      }">${item.name}</ui5-li>`
    );
  }, "");
  parent.innerHTML = items;
}
