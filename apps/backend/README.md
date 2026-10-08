# Backend

Install dependencies with `bun install` from the repository root.

From the repository root:

```sh
bun run --cwd apps/backend dev
```

Use `start` instead of `dev` to run without watch mode. These scripts load both the root `.env` (`DATABASE_URL`, `JWT_SECRET`) and `apps/backend/.env` (`RESEND_API_KEY`, `GOOGLE_CLIENT_ID`). They do not change either file.

## Authentication

- `POST /user/signup`: `{ username, email, password }`; creates a pending account and emails a six-digit code.
- `POST /user/verify-email`: `{ email, code }`; verifies and consumes an unexpired code atomically, then returns an app JWT.
- `POST /user/signin`: `{ identifier, password }`; accepts username or email for verified password accounts. Google-only accounts receive a message directing them to Google sign-in.
- `POST /user/google`: `{ credential }`; verifies the Google ID token against `GOOGLE_CLIENT_ID`. Returning Google accounts sign in; new accounts and their provider links are created together. An existing email account is not automatically linked. The returned app token lasts seven days.

The frontend's public `VITE_GOOGLE_CLIENT_ID` must match `GOOGLE_CLIENT_ID`. Configure the frontend origin in Google's OAuth Web client. A real Google login and email delivery require valid provider configuration; mocked tests do not verify provider setup.

There is currently no resend-code endpoint. Codes expire after ten minutes. The default sender `onboarding@resend.dev` also remains subject to Resend's test-domain restrictions; use an authorized sender/domain when configuring production email.

## Checks

```sh
bun run --cwd apps/backend check-types
bun run --cwd apps/backend test
```

Authentication tests mock Prisma, Google verification, and email delivery; they never use the live database or send emails.
