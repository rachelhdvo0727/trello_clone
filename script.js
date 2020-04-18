"use strict";
import { dataTrello, apiKey, addNewBtn, form } from "./partials/vars";
window.addEventListener("DOMContentLoaded", start);
function start() {
  addNewBtn.addEventListener("click", (evt) => {
    form.classList.toggle("hidden");
  });
}
