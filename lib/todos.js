const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "todos.json");
const BLOB_KEY = "todos";

function isNetlifyRuntime() {
  return Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ items: [] }, null, 2));
  }
}

async function getBlobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "honeydo", consistency: "strong" });
}

async function readTodos() {
  if (isNetlifyRuntime()) {
    const store = await getBlobStore();
    return (await store.get(BLOB_KEY, { type: "json" })) || { items: [] };
  }

  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

async function writeTodos(data) {
  if (isNetlifyRuntime()) {
    const store = await getBlobStore();
    await store.setJSON(BLOB_KEY, data);
    return;
  }

  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function createTodo(text) {
  const data = await readTodos();
  const item = {
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  data.items.unshift(item);
  await writeTodos(data);
  return item;
}

async function updateTodo(id, updates) {
  const data = await readTodos();
  const item = data.items.find((t) => t.id === id);
  if (!item) return null;

  if (typeof updates.completed === "boolean") {
    item.completed = updates.completed;
  }
  if (updates.text !== undefined) {
    const text = updates.text.trim();
    if (!text) return { error: "Text cannot be empty" };
    item.text = text;
  }

  await writeTodos(data);
  return item;
}

async function deleteTodo(id) {
  const data = await readTodos();
  const index = data.items.findIndex((t) => t.id === id);
  if (index === -1) return false;

  data.items.splice(index, 1);
  await writeTodos(data);
  return true;
}

module.exports = {
  readTodos,
  writeTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  ensureDataFile,
};
