"use strict";
import { dataTrello, apiKey, addNewBtn, form, displayList, cardTemplate, clone } from "./partials/vars";
window.addEventListener("DOMContentLoaded", start);
function start() {
  addNewBtn.addEventListener("click", (evt) => {
    form.classList.toggle("hidden");
  });
  getData();
}
function getData() {
  document.querySelector("#todoList > .list").innerHTML = "";
  fetch(dataTrello, {
    method: "get",
    headers: {
      accept: "application/json",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
  })
    .then((e) => e.json())
    .then(showData);
}
function showData(e) {
  e.forEach(showTasks);
}
function showTasks(task) {
  clone.querySelector(".title").textContent = task.task_name;
  clone.querySelector(".descr").textContent = task.description;
  clone.querySelector(".estimate").textContent = task.estimate;
  displayList.appendChild(clone);
}
function postData(data) {
  const post = JSON.stringify(data);
  fetch(endpoint, {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
    body: postData,
  })
    .then((res) => res.json())
    .then((data) => showTasks(data));
}
