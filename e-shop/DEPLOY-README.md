# E-Shop deployment

This app uses one Express service to serve both the static frontend and the `/users` API.

## Deploy to Render

1. Upload this project folder to a new GitHub repository (do not upload `node_modules`; it has been excluded).
2. In Render, choose **New + → Blueprint** and connect that repository.
3. Render reads `render.yaml`, installs backend dependencies, creates `ACCESS_SECRET` and `REFRESH_SECRET`, and starts the app.
4. After deployment finishes, open the `onrender.com` URL Render assigns to the service. That is the public E-Shop link.

The frontend API helper has been changed to use same-origin `/users/...` endpoints, which is required because Express serves the frontend and API from the same deployed service.

## Important limitation

The current project has no persistent database configured in the supplied source; verify the user repository/model before treating registration as production-ready. This deployment is suitable for a demo unless persistent storage, rate limiting, and production security settings are added.
