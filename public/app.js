const todoList = document.getElementById("todo-list");
const addForm = document.getElementById("add-form");
const todoInput = document.getElementById("todo-input");
const emptyState = document.getElementById("empty-state");
const taskCount = document.getElementById("task-count");
const filterBtns = document.querySelectorAll(".filter-btn");

let todos = [];
let filter = "all";

async function fetchTodos() {
  const res = await fetch("/api/todos");
  const data = await res.json();
  todos = data.items;
  render();
}

async function addTodo(text) {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) return;
  const item = await res.json();
  todos.unshift(item);
  render();
}

async function toggleTodo(id, completed) {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) return;
  const updated = await res.json();
  todos = todos.map((t) => (t.id === id ? updated : t));
  render();
}

async function deleteTodo(id) {
  const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
  if (!res.ok) return;
  todos = todos.filter((t) => t.id !== id);
  render();
}

function filteredTodos() {
  if (filter === "active") return todos.filter((t) => !t.completed);
  if (filter === "done") return todos.filter((t) => t.completed);
  return todos;
}

function render() {
  const visible = filteredTodos();
  todoList.innerHTML = "";

  visible.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-check";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`);
    checkbox.addEventListener("change", () => toggleTodo(todo.id, checkbox.checked));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "todo-delete";
    deleteBtn.setAttribute("aria-label", `Delete "${todo.text}"`);
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, text, deleteBtn);
    todoList.appendChild(li);
  });

  emptyState.hidden = visible.length > 0;
  const active = todos.filter((t) => !t.completed).length;
  taskCount.textContent =
    active === 1 ? "1 task remaining" : `${active} tasks remaining`;
}

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  addTodo(text);
  todoInput.value = "";
  todoInput.focus();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  });
});

fetchTodos();
