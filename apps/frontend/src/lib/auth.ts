import { API_URL } from "../config";
const PENDING_EMAIL_KEY = "pendingVerificationEmail";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export async function authRequest(
  path: "/signup" | "/signin" | "/verify-email" | "/google",
  body: Record<string, string>,
  signal?: AbortSignal,
): Promise<{ token?: string; message?: string }> {
  let response: Response;
  try {
    const timeout = AbortSignal.timeout(20_000);
    response = await fetch(`${API_URL}/user${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Unable to reach the server. Please try again in a moment.");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new AuthError(
      typeof data?.message === "string" ? data.message : "Something went wrong. Please try again.",
      response.status,
    );
  }
  if (!data || typeof data !== "object") {
    throw new Error("The server returned an unexpected response. Please try again.");
  }
  return data;
}

export function finishSignIn(token: unknown) {
  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Sign-in could not be completed. Please try again.");
  }
  localStorage.setItem("token", token);
  rememberVerificationEmail("");
}

export function rememberVerificationEmail(email: string) {
  try {
    if (email) sessionStorage.setItem(PENDING_EMAIL_KEY, email);
    else sessionStorage.removeItem(PENDING_EMAIL_KEY);
  } catch {
    // Verification still works when the browser disallows session storage.
  }
}

export function pendingVerificationEmail() {
  try { return sessionStorage.getItem(PENDING_EMAIL_KEY) ?? ""; }
  catch { return ""; }
}
