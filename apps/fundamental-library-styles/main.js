import "./style.scss";
import "@ui5/webcomponents/dist/Button"; // ui5-button
import "@ui5/webcomponents-fiori/dist/ShellBar"; // ui5-shellbar
import "@ui5/webcomponents/dist/Avatar"; // ui5-avatar

import "@ui5/webcomponents/dist/Link"; // ui5-link
import "@ui5/webcomponents/dist/Breadcrumbs"; // ui5-breadcrumbs

import "@ui5/webcomponents/dist/Panel"; // ui5-panel
import "@ui5/webcomponents/dist/Button"; // ui5-button
import "@ui5/webcomponents/dist/Input"; // ui5-input

import "@ui5/webcomponents/dist/List"; // ui5-list
import "@ui5/webcomponents/dist/StandardListItem"; // ui5-li

import "@ui5/webcomponents-icons/dist/AllIcons";
import "@ui5/webcomponents-icons-business-suite/dist/bottle"; // bottle icon

import "fundamental-styles/dist/button.css";
import "fundamental-styles/dist/bar.css";
import "fundamental-styles/dist/page.css";
import "fundamental-styles/dist/icon.css";
import "fundamental-styles/dist/popover.css";
import "fundamental-styles/dist/message-strip.css";

import "fundamental-styles/dist/theming/sap_horizon.css";
import "@sap-theming/theming-base-content/content/Base/baseLib/sap_horizon/css_variables.css";

import { bindBeerItems } from "./databinding";

let beers = [];

fetch("/Beers.json")
  .then((response) => {
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error(response.statusText);
    }
  })
  .then((data) => {
    beers = data;
    bindBeerItems(document.querySelector("#myList"), beers);
  })
  .catch((err) => console.error(err));

document.querySelector("#clearList").addEventListener("click", () => {
  beers = [];
  bindBeerItems(document.querySelector("#myList"), beers)
});

document.querySelector("#addBeer").addEventListener("click", function onSubmit() {
  const name = document.querySelector("#name");
  const ibu = document.querySelector("#ibu");
  const abv = document.querySelector("#abv");

  let allValid = true;

  if (!name.value) {
    name.valueState = "Error";
    name.innerHTML = `<div slot="valueStateMessage">Please add a name for this beer.</div>`;
    allValid = false;
  } else {
    name.valueState = "None";
  }
  if (!abv.value) {
    abv.valueState = "Error";
    abv.innerHTML = `<div slot="valueStateMessage">Please add a numeric value for the Alcohol By Volume of this beer.</div>`;
    allValid = false;
  } else {
    abv.valueState = "None";
  }
  if (!ibu.value) {
    ibu.valueState = "Error";
    ibu.innerHTML = `<div slot="valueStateMessage">Please add a numeric value for the International Bitterness Unit of this beer.</div>`;
    allValid = false;
  } else {
    ibu.valueState = "None";
  }

  if (!allValid) {
    return;
  }

  beers = [
    {
      name: name.value,
      ibu: ibu.value,
      abv: abv.value,
    },
    ...beers,
  ];
  bindBeerItems(document.querySelector("#myList"), beers);

  name.value = "";
  ibu.value = "";
  abv.value = "";

  const strip = document.querySelector("#success-strip");
  strip.classList.remove("exercise-hidden");

  const popover = document.querySelector("#popoverForm");
  popover.ariaHidden = popover.ariaHidden === "true" ? "false" : "true";
});

document.querySelector("#addButton").addEventListener("click", () => {
  const popover = document.querySelector("#popoverForm");
  popover.ariaHidden = popover.ariaHidden === "true" ? "false" : "true";
});

document.querySelector("#closeButton").addEventListener("click", () => {
  const strip = document.querySelector("#success-strip");
  strip.classList.add("exercise-hidden");
});