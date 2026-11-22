"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Leaf, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
type Mode =
  "login" | "register" | "forgot-password" | "reset-password" | "verify-email";
const titles: Record<Mode, string> = {
  login: "Welcome back.",
  register: "Make room for your next sale.",
  "forgot-password": "Let’s get you back in.",
  "reset-password": "Choose a new password.",
  "verify-email": "Confirm your email.",
};
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [rawToken, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const characterGroups = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(
    (group) => group.test(password),
  ).length;
  const uniqueCharacters = new Set(password).size;
  const strength =
    password.length < 12 || uniqueCharacters < 5
      ? "Weak"
      : password.length >= 16 &&
          (characterGroups >= 3 || uniqueCharacters >= 10)
        ? "Strong"
        : "Moderate";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const value =
      new URLSearchParams(location.hash.slice(1)).get("token") || "";
    setToken(value);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    if (
      mode === "register" &&
      data.get("password") !== data.get("confirmPassword")
    ) {
      setBusy(false);
      setError("Your passwords do not match.");
      return;
    }
    const endpoint = mode === "verify-email" ? "verify" : mode;
    const payload =
      mode === "verify-email"
        ? { token: rawToken }
        : mode === "reset-password"
          ? { token: rawToken, password: data.get("password") }
          : mode === "forgot-password"
            ? { email: data.get("email") }
            : { email: data.get("email"), password: data.get("password") };
    try {
      const result = await api<{ message: string }>(`/auth/${endpoint}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (mode === "login" || mode === "register") {
        router.push(mode === "register" ? "/settings" : "/dashboard");
        router.refresh();
      } else {
        setMessage(result.message);
        if (rawToken) {
          history.replaceState(history.state, "", location.pathname);
          setToken("");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="grid min-h-svh bg-white lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
      <aside className="hidden bg-primary-hover text-white lg:flex lg:flex-col lg:p-10">
        <Link
          href="/"
          className="inline-flex min-h-11 w-fit items-center gap-2 text-2xl font-bold tracking-tight"
        >
          <Leaf />
          MarketMate
        </Link>
        <div
          aria-hidden="true"
          className="my-8 min-h-52 flex-1 rounded-xl bg-[url('/images/adire-tote.webp')] bg-cover bg-[center_66%]"
        />
        <p className="text-3xl font-semibold tracking-tight">
          Small business. Fresh possibilities.
        </p>
        <p className="mt-3 max-w-md text-green-100">
          Your products, your voice and a little help turning everyday ideas
          into your next promotion.
        </p>
      </aside>
      <section className="flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            {titles[mode]}
          </h1>
          <p className="mb-8 mt-3 text-muted-foreground">
            {mode === "register"
              ? "Create your account, then tell us about your business."
              : mode === "verify-email"
                ? "Use the button below to verify the link from your email."
                : "Your workspace is ready when you are."}
          </p>
          <form onSubmit={submit} className="space-y-5">
            {["login", "register", "forgot-password"].includes(mode) && (
              <label className="field">
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  placeholder="you@yourbusiness.com"
                />
              </label>
            )}
            {["login", "register", "reset-password"].includes(mode) && (
              <label className="field">
                Password
                <input
                  name="password"
                  type="password"
                  onChange={
                    mode === "register"
                      ? (event) => setPassword(event.target.value)
                      : undefined
                  }
                  minLength={12}
                  maxLength={128}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                />
                <span className="text-xs font-normal text-muted-foreground">
                  Use at least 12 characters.
                </span>
              </label>
            )}
            {mode === "register" && (
              <>
                {password && (
                  <p
                    aria-live="polite"
                    className="text-sm text-muted-foreground"
                  >
                    Password strength: <strong>{strength}</strong>. A longer
                    phrase with varied characters is easier to strengthen.
                  </p>
                )}
                <label className="field">
                  Confirm password
                  <input
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    maxLength={128}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    aria-invalid={!!confirmation && confirmation !== password}
                  />
                  {confirmation && confirmation !== password && (
                    <span className="text-sm text-red-700">
                      Your passwords do not match.
                    </span>
                  )}
                </label>
              </>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}
            {message && (
              <p
                role="status"
                className="rounded-lg bg-green-50 p-3 text-sm text-primary"
              >
                {message}
              </p>
            )}
            {!message && (
              <Button
                className="w-full"
                disabled={
                  busy ||
                  (["verify-email", "reset-password"].includes(mode) &&
                    !rawToken)
                }
              >
                {busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign in"
                    : mode === "register"
                      ? "Create account"
                      : mode === "forgot-password"
                        ? "Send reset link"
                        : mode === "reset-password"
                          ? "Save new password"
                          : "Verify email"}
              </Button>
            )}
            {["verify-email", "reset-password"].includes(mode) &&
              !rawToken &&
              !message && (
                <p className="text-sm text-muted-foreground">
                  Open the full link from your email.{" "}
                  {mode === "verify-email" && (
                    <Link href="/settings" className="underline">
                      Request a fresh link in Settings.
                    </Link>
                  )}
                </p>
              )}
          </form>
          <div className="mt-6 flex flex-wrap justify-between gap-x-3 border-t border-border pt-3 text-sm font-medium text-primary [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center hover:[&_a]:underline">
            {mode === "login" ? (
              <>
                <Link href="/register">Create an account</Link>
                <Link href="/forgot-password">Forgot password?</Link>
              </>
            ) : (
              <Link href="/login">Return to sign in</Link>
            )}
            {mode === "verify-email" && (
              <Link href="/settings">Continue to your business</Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
