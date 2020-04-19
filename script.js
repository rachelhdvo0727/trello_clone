"use strict";
import { dataTrello, apiKey, addNewBtn, form, displayList, cards, cardTemplate, clone, elements, formElms, errormsgs, validForm } from "./partials/vars";
window.addEventListener("DOMContentLoaded", start);
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
  let isDown = false;
  let mousePosition;
  let offset = [0, 0];
  clone.querySelector("#cardcontainer").dataset.id = task._id;
  clone.querySelector(".title").textContent = task.task_name;
  //clone.querySelector(".descr").textContent = task.description;
  clone.querySelector(".estimate").textContent = "ETC: " + task.estimate;
  clone.querySelector(".deadline").textContent = "Due: " + task.deadline;
  clone.querySelector(".priority").textContent = task.priority;
  clone.querySelector(".creator").textContent = "Created by: " + task.creator;
  clone.querySelector("button.close").addEventListener("click", (evt) => {
    deleteATask(task._id);
  });
  clone.querySelector("button.editbtn").addEventListener("click", (evt) => {
    getTasktoEdit(task._id, prepareForEdit);
  });
  displayList.appendChild(clone);
  document.querySelector(`#cardcontainer[data-id='${task._id}']`).addEventListener("mousedown", (evt) => {
    document.querySelector(`#cardcontainer[data-id='${task._id}']`).style.position = "absolute";
    isDown = true;
    offset = [
      document.querySelector(`#cardcontainer[data-id='${task._id}']`).offsetLeft - evt.clientX,
      document.querySelector(`#cardcontainer[data-id='${task._id}']`).offsetTop - evt.clientY
    ];
  }, true);
  document.addEventListener('mouseup', function () {
    isDown = false;
  }, true);
  document.addEventListener('mousemove', function (event) {
    event.preventDefault();
    if (isDown) {
      mousePosition = {
        x: event.clientX,
        y: event.clientY
      };
      document.querySelector(`#cardcontainer[data-id='${task._id}']`).style.left = (mousePosition.x + offset[0]) + 'px';
      document.querySelector(`#cardcontainer[data-id='${task._id}']`).style.top = (mousePosition.y + offset[1]) + 'px';
    }
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    document.querySelector(`#cardcontainer[data-id='${task._id}']`).hidden = false;

    if (!elemBelow) return;
    let currentDroppable = null;
    let droppableBelow = elemBelow.closest("#progressList > .list2, #doneList > .list3");
    if (currentDroppable != droppableBelow) {
      if (currentDroppable) { // null when we were not over a droppable before this event
        leaveDroppable(currentDroppable);
      }
      currentDroppable = droppableBelow;
      if (currentDroppable) { // null if we're not coming over a droppable now
        // (maybe just left the droppable)
        enterDroppable(currentDroppable);
      }
    }
    function enterDroppable(elem) {
      elem.style.background = 'pink';
    }

    function leaveDroppable(elem) {
      elem.style.background = '';
    }
  }, true);
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
        putNewData({
          task_name: elements.taskName.value,
          description: elements.describe.value,
          estimate: elements.estimate.value,
          deadline: elements.deadline.value,
          priority: elements.priority.value,
          creator: elements.creator.value,
        }, form.dataset.id);
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
    .then((data) => { });
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
  })

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
      copy.querySelector(".deadline").textContent = "Due: " + data.deadline;
      copy.querySelector(".priority").textContent = data.priority;
      copy.querySelector(".creator").textContent = "Created by: " + data.creator;
      copy.querySelector("button.close").addEventListener("click", (evt) => {
        deleteATask(data._id);
      });
      copy.querySelector("button.editbtn").addEventListener("click", (evt) => {
        getTasktoEdit(data._id, prepareForEdit);
      })

    }
    );
}