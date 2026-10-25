# E-Shop deployment (Vercel)

One Express app (`backend/src/server.js`) serves both the static frontend and the `/users` API.

## Database (required for login to work)

Vercel runs the app as serverless functions, so anything kept in memory is lost between requests.
User accounts are therefore stored in MongoDB.

1. In Vercel → project → **Storage**, add **MongoDB Atlas** (free plan) and connect it to this project.
2. Check that `MONGODB_URI` appears under **Environment Variables**.
3. Optionally set `ACCESS_SECRET` and `REFRESH_SECRET` to long random strings.
4. Redeploy.

Without `MONGODB_URI` the server falls back to in-memory storage, which is only suitable for local development.
