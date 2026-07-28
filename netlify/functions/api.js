const {
  configureBlobs,
  readTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("../../lib/todos");

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? "" : JSON.stringify(body),
  };
}

function parseRoute(pathname) {
  const match = pathname.match(
    /(?:\/api|\/\.netlify\/functions\/api)\/todos(?:\/([^/]+))?\/?$/
  );
  if (!match) return null;
  return { id: match[1] || null };
}

exports.handler = async (event) => {
  configureBlobs(event);

  const route = parseRoute(event.path);
  if (!route) {
    return jsonResponse(404, { error: "Not found" });
  }

  const method = event.httpMethod;
  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      return jsonResponse(400, { error: "Invalid JSON" });
    }
  }

  try {
    if (method === "GET" && !route.id) {
      return jsonResponse(200, await readTodos());
    }

    if (method === "POST" && !route.id) {
      const { text } = body;
      if (!text || !text.trim()) {
        return jsonResponse(400, { error: "Text is required" });
      }
      const item = await createTodo(text);
      return jsonResponse(201, item);
    }

    if (method === "PATCH" && route.id) {
      const result = await updateTodo(route.id, body);
      if (result?.error) {
        return jsonResponse(400, { error: result.error });
      }
      if (!result) {
        return jsonResponse(404, { error: "Not found" });
      }
      return jsonResponse(200, result);
    }

    if (method === "DELETE" && route.id) {
      const deleted = await deleteTodo(route.id);
      if (!deleted) {
        return jsonResponse(404, { error: "Not found" });
      }
      return { statusCode: 204, body: "" };
    }

    return jsonResponse(405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
