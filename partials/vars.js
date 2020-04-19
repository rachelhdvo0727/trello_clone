export const apiKey = "5e956ffd436377171a0c230f";
export const dataTrello =
  "https://frontendspring20-e4cd.restdb.io/rest/trelloclone";
export const addNewBtn = document.querySelector(".addNew");
export const form = document.querySelector("form");
export const displayList = document.querySelector("#todoList > .list");
export const cardTemplate = document.querySelector("template").content;
export const clone = cardTemplate.cloneNode(true);
export const elements = form.elements;
export const formElms = form.querySelectorAll("input");
export const errormsgs = document.querySelectorAll(".msg");
export const cards = document.querySelectorAll("#cardcontainer");
export let validForm = true;