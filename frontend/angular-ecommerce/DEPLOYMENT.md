# Frontend deployment checklist

The production browser build calls the backend through same-origin `/api`. Configure
the hosting reverse proxy to forward `/api` to the Spring Boot service.

For Angular SSR, set `API_BASE_URL` to the absolute backend URL when the backend is
not reachable through the frontend host. Example:

```text
API_BASE_URL=https://api.example.com/api
```

Serve the site only over HTTPS. The SSR server adds baseline security headers,
including a content security policy. Update `CORS_ALLOWED_ORIGINS` on the backend
when the frontend origin changes.
