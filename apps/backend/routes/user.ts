import express from "express";
import jwt from "jsonwebtoken";
import prisma from "db/client";
import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { Resend } from "resend";
import {
  signinSchema,
  signupSchema,
  verifyEmailSchema,
} from "../validators/auth";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.get("/dashboard", async (req, res) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: "Sign-in is not configured" });
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please sign in to view your dashboard." });
  }
  let identity: { userId: number; displayName?: string };
  try {
    const decoded = jwt.verify(authorization.slice(7), secret);
    if (typeof decoded === "string" || !Number.isSafeInteger(decoded.userId) || decoded.userId <= 0) {
      throw new Error("Invalid identity");
    }
    identity = { userId: decoded.userId, displayName: typeof decoded.displayName === "string" ? decoded.displayName : undefined };
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: identity.userId },
      select: { id: true, username: true, email: true },
    });
    if (!user) return res.status(401).json({ message: "Please sign in again." });
    const totalTasks = await prisma.issue.count({
      where: {
        board: {
          OR: [
            { userId: user.id, orgId: null },
            { org: { membership: { some: { userId: user.id } } } },
          ],
        },
      },
    });
    return res.json({
      user: { id: user.id, displayName: identity.displayName?.trim() || user.username || user.email.split("@")[0] },
      totalTasks,
    });
  } catch {
    return res.status(500).json({ message: "Unable to load your dashboard. Please try again." });
  }
});

router.post("/signup", async (req, res) => {
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const { username, password, email } = result.data;
  const userExists = await prisma.user.findFirst({
    where: {
      OR: [{ username: result.data.username }, { email: result.data.email }],
    },
  });

  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hashedPassword, email },
  });

  const verificationCode = randomInt(100000, 1000000).toString();
  const codeHash = await bcrypt.hash(verificationCode, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.emailVerification.create({
    data: {
      codeHash,
      expiresAt,
      userId: user.id,
    },
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>
      <p>Your verification code is:</p>
      <h1>${verificationCode}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });

  if (error) {
    console.error("Failed to send verification email:", error);

    return res.status(500).json({
      message: "Failed to send verification email",
    });
  }

  return res.status(201).json({
    message: "Account created. Please verify your email",
    user: { id: user.id, username: user.username },
  });
});

router.post("/verify-email", async (req, res) => {
  const result = verifyEmailSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: "Enter a valid email and six-digit code" });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: "JWT_SECRET is not configured" });
  }

  try {
    const { email, code } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid verification request" });
    }
    const verification = await prisma.emailVerification.findUnique({
      where: { userId: user.id },
    });
    if (!verification) {
      return res.status(400).json({ message: "Verification code not found" });
    }
    if (verification.expiresAt <= new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }
    if (!(await bcrypt.compare(code, verification.codeHash))) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Prepare the token first so a signing error cannot consume the code.
    const token = jwt.sign({ userId: user.id }, jwtSecret);
    const verified = await prisma.$transaction(async (tx) => {
      // Only one request can consume this exact, still-valid code.
      const consumed = await tx.emailVerification.deleteMany({
        where: {
          id: verification.id,
          userId: user.id,
          codeHash: verification.codeHash,
          expiresAt: { gt: new Date() },
        },
      });
      if (consumed.count !== 1) return false;
      await tx.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
      return true;
    });
    if (!verified) {
      return res
        .status(400)
        .json({ message: "Verification code has expired or was already used" });
    }
    return res.json({ message: "Email verified successfully", token });
  } catch {
    return res
      .status(500)
      .json({ message: "Unable to verify your email. Please try again." });
  }
});

router.post("/google", async (req, res) => {
  const credential = req.body?.credential;
  if (typeof credential !== "string" || !credential.trim()) {
    return res.status(400).json({ message: "Google credential is required" });
  }
  const jwtSecret = process.env.JWT_SECRET;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!jwtSecret || !googleClientId) {
    return res
      .status(500)
      .json({ message: "Google sign-in is not configured" });
  }

  let payload:
    { sub?: string; email?: string; email_verified?: boolean; name?: string; given_name?: string } | undefined;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: "Invalid Google credential" });
  }
  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    return res
      .status(401)
      .json({ message: "Invalid Google account information" });
  }

  const { sub: googleId, email } = payload;
  const displayName = payload.given_name?.trim() || payload.name?.trim() || email.split("@")[0];
  const accountKey = {
    provider_providerAccountId: {
      provider: "google",
      providerAccountId: googleId,
    },
  };
  const signIn = (userId: number, status = 200) =>
    res.status(status).json({
      message:
        status === 201
          ? "Google account created successfully"
          : "Signed in successfully",
      token: jwt.sign({ userId, displayName }, jwtSecret, { expiresIn: "7d" }),
    });
  const emailConflict = () =>
    res.status(409).json({
      message:
        "An account with this email already exists. Sign in using your existing sign-in method.",
    });

  try {
    const existingAccount = await prisma.oAuthAccount.findUnique({
      where: accountKey,
    });
    if (existingAccount) {
      // Google's stable subject identifies returning users, even if their email changes.
      return signIn(existingAccount.userId);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return emailConflict();

    // Create the user and provider link together; never leave an unlinked Google user.
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, emailVerified: true, username: null, password: null },
      });
      await tx.oAuthAccount.create({
        data: {
          provider: "google",
          providerAccountId: googleId,
          userId: user.id,
        },
      });
      return user;
    });
    return signIn(newUser.id, 201);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      // Another request may have just created this same Google account.
      try {
        const account = await prisma.oAuthAccount.findUnique({
          where: accountKey,
        });
        if (account) return signIn(account.userId);
        return emailConflict();
      } catch {
        return res
          .status(500)
          .json({
            message: "Unable to sign in with Google. Please try again.",
          });
      }
    }
    return res
      .status(500)
      .json({ message: "Unable to sign in with Google. Please try again." });
  }
});

router.post("/signin", async (req, res) => {
  const result = signinSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "JWT_SECRET is not configured" });
  }

  const { identifier, password } = result.data;
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });
  if (!user) {
    return res.status(403).json({
      message: "user does not exist",
    });
  }

  if (!user.password) {
    return res
      .status(401)
      .json({
        message:
          "This account uses Google sign-in. Please continue with Google.",
      });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  if (!user.emailVerified) {
    return res.status(403).json({
      message: "Please verify your email before signing in",
    });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  return res.json({ token });
});

export default router;
