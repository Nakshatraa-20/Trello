// Google Identity Services returns an ID token. The backend verifies it.
// https://developers.google.com/identity/gsi/web/reference/js-reference
export interface GoogleCredential { credential: string }
interface GoogleIdentity {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredential) => void;
    auto_select: boolean;
    ux_mode: "popup";
  }): void;
  renderButton(element: HTMLElement, config: {
    type: "standard";
    theme: "outline";
    size: "large";
    text: "continue_with";
    shape: "pill";
    width: number;
  }): void;
}

declare global {
  interface Window { google?: { accounts: { id: GoogleIdentity } } }
}

let loading: Promise<GoogleIdentity> | null = null;
let initializedClientId = "";
let credentialHandler: ((response: GoogleCredential) => void) | null = null;

export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (window.google?.accounts.id) return Promise.resolve(window.google.accounts.id);
  if (loading) return loading;

  loading = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(() => fail(), 15_000);
    function fail() {
      window.clearTimeout(timer);
      script.remove();
      loading = null;
      reject(new Error("Google sign-in could not load. Check your connection and try again."));
    }
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.clearTimeout(timer);
      if (window.google?.accounts.id) resolve(window.google.accounts.id);
      else fail();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return loading;
}

export function registerGoogleCredentialHandler(
  identity: GoogleIdentity,
  clientId: string,
  handler: (response: GoogleCredential) => void,
) {
  if (initializedClientId !== clientId) {
    identity.initialize({
      client_id: clientId,
      callback: (response) => credentialHandler?.(response),
      auto_select: false,
      ux_mode: "popup",
    });
    initializedClientId = clientId;
  }
  credentialHandler = handler;
  return () => { if (credentialHandler === handler) credentialHandler = null; };
}
