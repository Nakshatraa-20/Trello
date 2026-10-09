import { afterAll, beforeEach, expect, mock, test } from "bun:test";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

// Mock external boundaries before importing the router. No real email or DB access.
const previousSecret = process.env.JWT_SECRET;
const previousClientId = process.env.GOOGLE_CLIENT_ID;
process.env.JWT_SECRET = "auth-test-secret";
process.env.GOOGLE_CLIENT_ID = "auth-test-client";

type User = {
  id: number;
  email: string;
  username: string | null;
  password: string | null;
  emailVerified: boolean;
};
type Verification = {
  id: number;
  userId: number;
  codeHash: string;
  expiresAt: Date;
};
type Account = { provider: string; providerAccountId: string; userId: number };
let users: User[];
let verification: Verification | null;
let accounts: Account[];
let failUserUpdate = false;
let failAccountCreate = false;
let consumedByAnotherRequest = false;
let raceAccountCreation = false;
let databaseFailure = false;
let payload:
  { sub?: string; email?: string; email_verified?: boolean } | undefined;
let invalidGoogleCredential = false;

const compare = mock(
  async (plain: string, hash: string) => hash === `hash:${plain}`,
);
const sendEmail = mock(async () => ({ error: null }));
const verifyIdToken = mock(async (_options: unknown) => {
  if (invalidGoogleCredential) throw new Error("Invalid token");
  return { getPayload: () => payload };
});
mock.module("bcrypt", () => ({
  default: { compare, hash: async (plain: string) => `hash:${plain}` },
}));
mock.module("resend", () => ({
  Resend: class {
    emails = { send: sendEmail };
  },
}));
mock.module("google-auth-library", () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdToken;
  },
}));

const db = {
  user: {
    findUnique: mock(
      async ({ where }: any) =>
        users.find((user) => user.email === where.email) ?? null,
    ),
    findFirst: mock(
      async ({ where }: any) =>
        users.find((user) =>
          where.OR.some(
            (filter: any) =>
              (filter.email !== undefined && filter.email === user.email) ||
              (filter.username !== undefined &&
                filter.username === user.username),
          ),
        ) ?? null,
    ),
    create: mock(async ({ data }: any) => {
      const user = { id: users.length + 1, emailVerified: false, ...data };
      users.push(user);
      return { ...user };
    }),
    update: mock(async ({ where, data }: any) => {
      if (failUserUpdate) throw new Error("Write failed");
      const user = users.find((user) => user.id === where.id)!;
      Object.assign(user, data);
      return { ...user };
    }),
  },
  emailVerification: {
    create: mock(async ({ data }: any) => {
      verification = { id: 1, ...data };
      return verification;
    }),
    findUnique: mock(async () => (verification ? { ...verification } : null)),
    deleteMany: mock(async ({ where }: any) => {
      if (
        consumedByAnotherRequest ||
        !verification ||
        verification.id !== where.id ||
        verification.codeHash !== where.codeHash ||
        verification.expiresAt <= where.expiresAt.gt
      )
        return { count: 0 };
      verification = null;
      return { count: 1 };
    }),
  },
  oAuthAccount: {
    findUnique: mock(async ({ where }: any) => {
      if (databaseFailure) throw new Error("Database unavailable");
      const key = where.provider_providerAccountId;
      return (
        accounts.find(
          (account) =>
            account.provider === key.provider &&
            account.providerAccountId === key.providerAccountId,
        ) ?? null
      );
    }),
    create: mock(async ({ data }: any) => {
      if (failAccountCreate) throw new Error("Provider link failed");
      accounts.push(data);
      return data;
    }),
  },
};
const transaction = mock(
  async (operation: (tx: typeof db) => Promise<unknown>) => {
    if (raceAccountCreation) {
      raceAccountCreation = false;
      users.push({
        id: 8,
        email: payload!.email!,
        username: null,
        password: null,
        emailVerified: true,
      });
      accounts.push({
        provider: "google",
        providerAccountId: payload!.sub!,
        userId: 8,
      });
      throw { code: "P2002" };
    }
    const snapshot = structuredClone({ users, verification, accounts });
    try {
      return await operation(db);
    } catch (error) {
      ({ users, verification, accounts } = snapshot);
      throw error;
    }
  },
);
mock.module("db/client", () => ({
  default: { ...db, $transaction: transaction },
}));
const { default: router } = await import("./user");

async function request(path: string, body: unknown) {
  const route = router.stack.find(
    (layer: any) => layer.route?.path === path,
  )?.route;
  if (!route) throw new Error(`Missing route ${path}`);
  const result = { status: 200, body: {} as any };
  const response = {
    status(code: number) {
      result.status = code;
      return response;
    },
    json(value: unknown) {
      result.body = value;
      return response;
    },
  };
  const handler = route.stack[0]?.handle;
  if (!handler) throw new Error(`Missing handler for route ${path}`);
  await handler(
    { body } as Request,
    response as Response,
    (error?: unknown) => {
      throw error ?? new Error(`Unexpected next() call in route ${path}`);
    },
  );
  return result;
}
function tokenUser(token: string) {
  return (jwt.verify(token, "auth-test-secret") as { userId: number }).userId;
}

beforeEach(() => {
  users = [
    {
      id: 1,
      email: "alice@example.test",
      username: "alice",
      password: "hash:password123",
      emailVerified: false,
    },
  ];
  verification = {
    id: 1,
    userId: 1,
    codeHash: "hash:123456",
    expiresAt: new Date(Date.now() + 600_000),
  };
  accounts = [];
  payload = {
    sub: "google-user",
    email: "google@example.test",
    email_verified: true,
  };
  failUserUpdate =
    failAccountCreate =
    consumedByAnotherRequest =
    raceAccountCreation =
    databaseFailure =
    invalidGoogleCredential =
      false;
  process.env.JWT_SECRET = "auth-test-secret";
  process.env.GOOGLE_CLIENT_ID = "auth-test-client";
  compare.mockClear();
  sendEmail.mockClear();
  verifyIdToken.mockClear();
  transaction.mockClear();
  db.user.create.mockClear();
  db.user.update.mockClear();
  db.emailVerification.deleteMany.mockClear();
});
afterAll(() => {
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
  if (previousClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
  else process.env.GOOGLE_CLIENT_ID = previousClientId;
});

test("only one Google route is registered", () => {
  expect(
    router.stack.filter((layer: any) => layer.route?.path === "/google"),
  ).toHaveLength(1);
});
test("returning Google user receives their existing user ID", async () => {
  accounts.push({
    provider: "google",
    providerAccountId: "google-user",
    userId: 1,
  });
  const result = await request("/google", { credential: "test-id-token" });
  expect(result.status).toBe(200);
  expect(tokenUser(result.body.token)).toBe(1);
  expect(db.user.create).not.toHaveBeenCalled();
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: "test-id-token",
    audience: "auth-test-client",
  });
});
test("new Google user and provider link are created together", async () => {
  const result = await request("/google", { credential: "test-id-token" });
  expect(result.status).toBe(201);
  expect(tokenUser(result.body.token)).toBe(2);
  expect(users[1]).toMatchObject({
    emailVerified: true,
    password: null,
    username: null,
  });
  expect(accounts[0]).toEqual({
    provider: "google",
    providerAccountId: "google-user",
    userId: 2,
  });
  expect(transaction).toHaveBeenCalledTimes(1);
});
test("existing email is not automatically linked to Google", async () => {
  payload!.email = "alice@example.test";
  const result = await request("/google", { credential: "test-id-token" });
  expect(result.status).toBe(409);
  expect(result.body.token).toBeUndefined();
  expect(accounts).toHaveLength(0);
});
test("concurrent Google account creation reuses the winning account", async () => {
  raceAccountCreation = true;
  const result = await request("/google", { credential: "test-id-token" });
  expect(result.status).toBe(200);
  expect(tokenUser(result.body.token)).toBe(8);
});
test("failed provider-link write rolls back the new user", async () => {
  failAccountCreate = true;
  const result = await request("/google", { credential: "test-id-token" });
  expect(result.status).toBe(500);
  expect(users).toHaveLength(1);
  expect(accounts).toHaveLength(0);
});
test("missing Google credentials are rejected before token verification", async () => {
  expect((await request("/google", {})).status).toBe(400);
  expect((await request("/google", { credential: 12 })).status).toBe(400);
  expect(verifyIdToken).not.toHaveBeenCalled();
});
test("invalid or unverified Google identities cannot sign in", async () => {
  invalidGoogleCredential = true;
  expect((await request("/google", { credential: "bad" })).status).toBe(401);
  invalidGoogleCredential = false;
  payload!.email_verified = false;
  expect((await request("/google", { credential: "unverified" })).status).toBe(
    401,
  );
  expect(db.user.create).not.toHaveBeenCalled();
});
test("Google configuration and database errors have server-error responses", async () => {
  delete process.env.GOOGLE_CLIENT_ID;
  expect((await request("/google", { credential: "token" })).status).toBe(500);
  process.env.GOOGLE_CLIENT_ID = "auth-test-client";
  databaseFailure = true;
  expect((await request("/google", { credential: "token" })).status).toBe(500);
});
test("Google-only account never passes a null password to bcrypt", async () => {
  users[0]!.password = null;
  const result = await request("/signin", {
    identifier: "alice@example.test",
    password: "password123",
  });
  expect(result.status).toBe(401);
  expect(result.body.message).toContain("Google");
  expect(compare).not.toHaveBeenCalled();
});
test("verified password account signs in by username or email", async () => {
  users[0]!.emailVerified = true;
  for (const identifier of ["alice", "alice@example.test"]) {
    const result = await request("/signin", {
      identifier,
      password: "password123",
    });
    expect(result.status).toBe(200);
    expect(tokenUser(result.body.token)).toBe(1);
  }
});
test("wrong password and unverified email cannot sign in", async () => {
  expect(
    (await request("/signin", { identifier: "alice", password: "wrong" }))
      .status,
  ).toBe(401);
  expect(
    (await request("/signin", { identifier: "alice", password: "password123" }))
      .status,
  ).toBe(403);
});
test("valid OTP verifies the account, consumes the code, and issues a token", async () => {
  const result = await request("/verify-email", {
    email: "alice@example.test",
    code: "123456",
  });
  expect(result.status).toBe(200);
  expect(tokenUser(result.body.token)).toBe(1);
  expect(users[0]!.emailVerified).toBe(true);
  expect(verification).toBeNull();
  expect(transaction).toHaveBeenCalledTimes(1);
  expect(
    (
      await request("/verify-email", {
        email: "alice@example.test",
        code: "123456",
      })
    ).status,
  ).toBe(400);
});
test("invalid, nonnumeric, and expired OTPs leave the account untouched", async () => {
  for (const code of ["abcdef", "123", "111111"]) {
    expect(
      (await request("/verify-email", { email: "alice@example.test", code }))
        .status,
    ).toBe(400);
  }
  verification!.expiresAt = new Date(Date.now() - 1000);
  expect(
    (
      await request("/verify-email", {
        email: "alice@example.test",
        code: "123456",
      })
    ).status,
  ).toBe(400);
  expect(users[0]!.emailVerified).toBe(false);
  expect(db.emailVerification.deleteMany).not.toHaveBeenCalled();
});
test("a missing JWT secret does not consume a valid OTP", async () => {
  delete process.env.JWT_SECRET;
  expect(
    (
      await request("/verify-email", {
        email: "alice@example.test",
        code: "123456",
      })
    ).status,
  ).toBe(500);
  expect(verification).not.toBeNull();
  expect(users[0]!.emailVerified).toBe(false);
});
test("an OTP consumed by a concurrent request cannot issue another token", async () => {
  consumedByAnotherRequest = true;
  const result = await request("/verify-email", {
    email: "alice@example.test",
    code: "123456",
  });
  expect(result.status).toBe(400);
  expect(result.body.token).toBeUndefined();
  expect(db.user.update).not.toHaveBeenCalled();
});
test("a failed account update leaves the OTP available for retry", async () => {
  failUserUpdate = true;
  expect(
    (
      await request("/verify-email", {
        email: "alice@example.test",
        code: "123456",
      })
    ).status,
  ).toBe(500);
  expect(verification).not.toBeNull();
  expect(users[0]!.emailVerified).toBe(false);
});
test("signup stores a hashed six-digit code and sends through the mocked email provider", async () => {
  const result = await request("/signup", {
    username: "newuser",
    email: "new@example.test",
    password: "password123",
  });
  expect(result.status).toBe(201);
  expect(verification!.codeHash).toMatch(/^hash:\d{6}$/);
  expect(sendEmail).toHaveBeenCalledTimes(1);
  expect(result.body.token).toBeUndefined();
});
