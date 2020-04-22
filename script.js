require("@babel/polyfill");
import { moment } from "moment";
import {
  dataTrello,
  apiKey,
  addNewBtn,
  form,
  displayList,
  cards,
  elements,
  formElms,
  errormsgs,
  validForm,
} from "./jsmodules/vars";
//var moment = require("moment");

// const apiKey = "5e956ffd436377171a0c230f";
// const dataTrello = "https://frontendspring20-e4cd.restdb.io/rest/trelloclone";
// const addNewBtn = document.querySelector(".addNew");
// const form = document.querySelector("form");
// const displayList = document.querySelector("#todoList > .list");
// const elements = form.elements;
// const formElms = form.querySelectorAll("input");
// const errormsgs = document.querySelectorAll(".msg");
// const cards = document.querySelectorAll("#cardcontainer");
// let validForm = true;

document.addEventListener("DOMContentLoaded", start);

let i = 0;
function start() {
  addNewBtn.addEventListener("click", (evt) => {
    form.classList.toggle("hidden");
  });
  form.setAttribute("novalidate", true);
  checkInputData();
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
  const cardTemplate = document.querySelector("template").content;
  const clone = cardTemplate.cloneNode(true);
  clone.querySelector("#cardcontainer").dataset.id = task._id;
  clone.querySelector(".title").textContent = task.task_name;
  clone.querySelector(".descr").textContent = task.description;
  clone.querySelector(".estimate").textContent = "ETC: " + task.estimate;
  clone.querySelector(".deadline").textContent =
    "Due: " + moment(task.deadline).format("DD/MM/YYYY HH.MM");
  clone.querySelector(".priority").textContent = task.priority;
  clone.querySelector(".creator").textContent = "By: " + task.creator;
  clone.querySelector(".date_added").textContent = moment(
    task.date_added
  ).fromNow();
  clone.querySelector("button.close").addEventListener("click", () => {
    deleteATask(task._id);
  });
  clone.querySelector("button.editbtn").addEventListener("click", () => {
    getTasktoEdit(task._id, prepareForEdit);
  });
  clone.querySelector(".mvright").addEventListener("click", () => {
    moveRight(task._id);
  });
  clone.querySelector(".mvleft").addEventListener("click", () => {
    moveLeft(task._id);
  });
  displayList.appendChild(clone);
}
function moveRight(id) {
  let card = document.querySelector(`#cardcontainer[data-id='${id}']`);
  const lists = document.querySelectorAll(".list");
  i++;
  if (i === lists.length) {
    i = 0;
  }
  lists[i].appendChild(card);
}
function moveLeft(id) {
  let card = document.querySelector(`#cardcontainer[data-id='${id}']`);
  const lists = document.querySelectorAll(".list");
  i--;
  if (i < 0) {
    i = lists.length - 1;
  }
  lists[i].appendChild(card);
}
function postData(data) {
  const postData = JSON.stringify(data);
  fetch(dataTrello, {
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
function checkInputData() {
  form.addEventListener("submit", (evt) => {
    evt.preventDefault(); //turn off validation on submit
    formElms.forEach((elm) => {
      elm.classList.remove("invalid");
    });

    if (form.checkValidity() && validForm) {
      if (form.dataset.state === "post") {
        //send data
        postData({
          task_name: elements.taskName.value,
          description: elements.describe.value,
          estimate: elements.estimate.value,
          deadline: elements.deadline.value,
          priority: elements.priority.value,
          creator: elements.creator.value,
        });
      } else {
        putNewData(
          {
            task_name: elements.taskName.value,
            description: elements.describe.value,
            estimate: elements.estimate.value,
            deadline: elements.deadline.value,
            priority: elements.priority.value,
            creator: elements.creator.value,
          },
          form.dataset.id
        );
      }
      form.classList.add("hidden");
      form.reset();
    } else {
      //loop validity
      formElms.forEach((elm) => {
        elm.classList.remove("invalid");
        if (!elm.checkValidity()) {
          elm.classList.add("invalid");
        }
      });
    }
  });
}
function deleteATask(id) {
  document.querySelector(`#cardcontainer[data-id='${id}']`).remove();
  fetch(`${dataTrello}/${id}`, {
    method: "delete",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
  })
    .then((res) => res.json())
    .then((data) => {});
}
function prepareForEdit(data) {
  //show the form
  form.classList.remove("hidden");
  //populate the form
  form.dataset.state = "put";
  form.dataset.id = data._id;
  elements.taskName.value = data.task_name;
  elements.describe.value = data.description;
  elements.estimate.value = data.estimate;
  elements.deadline.value = data.deadline;
  elements.creator.value = data.creator;
  elements.priority.value = data.priority;
  document.querySelector(`input[value='${priority}']`).checked = true;
  //handle submits
  document.querySelector(".add").addEventListener("click", (e) => {
    checkInputData();
    form.classList.add("hidden");
    form.reset();
  });
}
function getTasktoEdit(id, callback) {
  fetch(`${dataTrello}/${id}`, {
    method: "get",
    headers: {
      accept: "application/json",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
  })
    .then((e) => e.json())
    .then((data) => callback(data));
}
function putNewData(data, id) {
  //document.querySelector(`#cardcontainer[data-id='${id}']`).replaceWith(data);
  const putData = JSON.stringify(data);
  fetch(`${dataTrello}/${id}`, {
    method: "put",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": apiKey,
      "cache-control": "no-cache",
    },
    body: putData,
  })
    .then((res) => res.json())
    .then((data) => {
      //showTasks(data)
      const copy = document.querySelector(`article[data-id='${id}']`);
      copy.querySelector(".title").textContent = data.task_name;
      //clone.querySelector(".descr").textContent = task.description;
      copy.querySelector(".estimate").textContent = "ETC: " + data.estimate;
      copy.querySelector(".deadline").textContent =
        "Due: " + moment(data.deadline).format("DD/MM/YYYY HH.MM");
      copy.querySelector(".priority").textContent = data.priority;
      copy.querySelector(".creator").textContent =
        "Created by: " + data.creator;
      copy.querySelector(".date_added").textContent = moment(
        data.date_added
      ).fromNow();
      copy.querySelector("button.close").addEventListener("click", () => {
        deleteATask(data._id);
      });
      copy.querySelector("button.editbtn").addEventListener("click", () => {
        getTasktoEdit(data._id, prepareForEdit);
      });
      copy.querySelector(".mvright").addEventListener("click", () => {
        moveRight(data._id);
      });
      copy.querySelector(".mvleft").addEventListener("click", () => {
        moveLeft(data._id);
      });
    });
}
