# Patient API configuration

For trusted local development, the browser uses `NEXT_PUBLIC_API_BASE_URL=http://localhost:5110` by default. Set this value in your own `.env.local` only if a different API origin is needed; restart the development server or rebuild for production after changing it. Use an HTTP(S) origin without credentials, a path, query, or fragment. Public environment values are included in the browser bundle: never put secrets in them.

A browser on another device interprets `localhost` as that device. Cross-device use requires an explicitly configured reachable API origin and separately approved backend, CORS, and security arrangements. The patient API is not currently authenticated and is not safe for public exposure. Do not use a public tunnel or assume this configuration provides authentication.
