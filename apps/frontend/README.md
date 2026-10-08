# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

## Email verification and Google sign-in

Auth pages use the existing cream/pink theme and Kalam font:

- `/signup` posts `{ username, email, password }` to `/user/signup`, then opens `/verify-email`.
- `/verify-email` posts `{ email, code }` to `/user/verify-email`. On success it stores the returned app token and opens `/dashboard`.
- `/login` posts `{ identifier, password }` to `/user/signin`; the identifier can be a username or email.
- Google buttons on signup and login use Google Identity Services. Its ID-token `credential` is posted to `/user/google`; only the app token returned by the backend is saved.

The pending verification email is kept in session storage so a refresh doesn't lose it. Passwords and verification codes aren't persisted. The verification page also accepts an email directly for returning users. There is no resend-code button because the backend currently has no resend endpoint.

### Local configuration

Copy `.env.example` to `.env.local` if a local file does not already exist:

```dotenv
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Use the same public OAuth Web client ID as the backend's `GOOGLE_CLIENT_ID`. Add `http://localhost:5173` to that client's Authorized JavaScript origins in Google Cloud, then restart Vite after changing environment variables. If you use a different frontend origin, configure it in both Google Cloud and backend CORS.

Only the public client ID belongs in the frontend. Never add the database URL, JWT secret, Resend API key, or OAuth client secret to a `VITE_` variable.

Google's setup guide: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
Google button API: https://developers.google.com/identity/gsi/web/reference/js-reference

### Current backend dependencies

The frontend expects a successful `/verify-email` or `/google` response to include a non-empty `token`. Backend errors appear on the relevant form. Requests time out instead of leaving the forms permanently busy.

At the time this frontend was added, `apps/backend/routes/user.ts` still had a duplicate `token` declaration and misplaced existing/new-account branches in `/google`, an empty duplicate `/google` route, and a nullable-password error in `/signin`. Those backend issues must be fixed before a real end-to-end Google sign-in can succeed. Expired OTPs require a backend resend-code endpoint to support recovery.
