const express = require("express");
const path = require("path");
const {
  readTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  ensureDataFile,
} = require("./lib/todos");
const {
  checkPassword,
  checkToken,
  getAuthToken,
  getTokenFromRequest,
} = require("./lib/auth");

const app = express();
const PORT = process.env.PORT || 4783;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function requireAuth(req, res, next) {
  if (!checkToken(getTokenFromRequest(req.headers))) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.post("/api/login", (req, res) => {
  const { password } = req.body || {};
  if (!checkPassword(password)) {
    return res.status(401).json({ error: "Incorrect password" });
  }
  res.json({ token: getAuthToken() });
});

app.get("/api/todos", requireAuth, async (_req, res) => {
  res.json(await readTodos());
});

app.post("/api/todos", requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Text is required" });
  }
  const item = await createTodo(text);
  res.status(201).json(item);
});

app.patch("/api/todos/:id", requireAuth, async (req, res) => {
  const result = await updateTodo(req.params.id, req.body);
  if (result?.error) {
    return res.status(400).json({ error: result.error });
  }
  if (!result) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(result);
});

app.delete("/api/todos/:id", requireAuth, async (req, res) => {
  const deleted = await deleteTodo(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Not found" });
  }
  res.status(204).end();
});

app.listen(PORT, () => {
  ensureDataFile();
  console.log(`The Honeydo List is running at http://localhost:${PORT}`);
});
