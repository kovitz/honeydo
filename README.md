# The Honeydo List

A simple shared to-do app for two people.

## Local development

**Option A — simple (JSON file on disk):**

```bash
npm install
npm start
```

Open [http://localhost:4783](http://localhost:4783).

**Option B — matches Netlify production (functions + Blobs):**

```bash
npm install
npm run dev
```

Open the URL shown by Netlify Dev (usually [http://localhost:8888](http://localhost:8888)).

## Deploy to Netlify

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In [Netlify](https://app.netlify.com), click **Add new site → Import an existing project**.
3. Connect your repo. Netlify will detect `netlify.toml` automatically:
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
4. Click **Deploy site**.

No environment variables are required. Tasks are stored in [Netlify Blobs](https://docs.netlify.com/storage/blobs/overview/) (a simple key-value store built into Netlify).

### Deploy from the CLI

```bash
npm install
npx netlify login
npx netlify init
npx netlify deploy --prod
```

## How it works

| Environment | Storage |
|-------------|---------|
| Local (`npm start`) | `data/todos.json` |
| Netlify / `netlify dev` | Netlify Blobs store named `honeydo` |

The API is the same in both environments:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/todos` | List all tasks |
| POST | `/api/todos` | Add a task `{ "text": "..." }` |
| PATCH | `/api/todos/:id` | Update `{ "completed": true }` or `{ "text": "..." }` |
| DELETE | `/api/todos/:id` | Remove a task |
